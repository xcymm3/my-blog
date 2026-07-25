import "server-only";

import { Pool } from "pg";

import {
  type GuestbookMessage,
  type GuestbookSortOrder,
  MAX_GUESTBOOK_MESSAGES,
} from "./guestbook-shared";

declare global {
  var guestbookInitPromise: Promise<void> | undefined;
  var guestbookPool: Pool | undefined;
}

type GuestbookRow = {
  content: string;
  created_at: Date | string;
  id: number | string;
  nickname: string;
};

type CreateGuestbookMessageInput = {
  content: string;
  nickname: string;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("缺少 DATABASE_URL 环境变量，无法连接留言数据库。");
  }

  return databaseUrl;
}

function getGuestbookPool() {
  if (!globalThis.guestbookPool) {
    globalThis.guestbookPool = new Pool({
      connectionString: getDatabaseUrl(),
      idleTimeoutMillis: 10_000,
      max: 3,
    });
  }

  return globalThis.guestbookPool;
}

async function ensureGuestbookTable() {
  if (!globalThis.guestbookInitPromise) {
    const pool = getGuestbookPool();

    globalThis.guestbookInitPromise = pool
      .query(
        `
        CREATE TABLE IF NOT EXISTS guestbook_messages (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          nickname VARCHAR(40) NOT NULL,
          content VARCHAR(1000) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS guestbook_messages_created_at_idx
          ON guestbook_messages (created_at DESC, id DESC);
      `,
      )
      .then(() => undefined);
  }

  return globalThis.guestbookInitPromise;
}

function toGuestbookMessage(row: GuestbookRow): GuestbookMessage {
  return {
    content: row.content,
    createdAt: new Date(row.created_at).toISOString(),
    id: Number(row.id),
    nickname: row.nickname,
  };
}

export async function listGuestbookMessages(
  order: GuestbookSortOrder,
): Promise<GuestbookMessage[]> {
  await ensureGuestbookTable();

  const direction = order === "asc" ? "ASC" : "DESC";
  const pool = getGuestbookPool();
  const { rows } = await pool.query<GuestbookRow>(`
    SELECT id, nickname, content, created_at
    FROM guestbook_messages
    ORDER BY created_at ${direction}, id ${direction}
    LIMIT ${MAX_GUESTBOOK_MESSAGES}
  `);

  return rows.map(toGuestbookMessage);
}

export async function createGuestbookMessage({
  content,
  nickname,
}: CreateGuestbookMessageInput): Promise<GuestbookMessage> {
  await ensureGuestbookTable();

  const pool = getGuestbookPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertResult = await client.query<GuestbookRow>(
      `
        INSERT INTO guestbook_messages (nickname, content)
        VALUES ($1, $2)
        RETURNING id, nickname, content, created_at
      `,
      [nickname, content],
    );

    await client.query(
      `
        DELETE FROM guestbook_messages
        WHERE id IN (
          SELECT id
          FROM guestbook_messages
          ORDER BY created_at DESC, id DESC
          OFFSET $1
        )
      `,
      [MAX_GUESTBOOK_MESSAGES],
    );

    await client.query("COMMIT");

    return toGuestbookMessage(insertResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteGuestbookMessage(id: number) {
  await ensureGuestbookTable();

  const pool = getGuestbookPool();
  const result = await pool.query("DELETE FROM guestbook_messages WHERE id = $1", [id]);

  return (result.rowCount ?? 0) > 0;
}
