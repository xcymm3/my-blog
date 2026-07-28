import "server-only";

import { Pool } from "pg";

export const GUESTBOOK_VISITOR_COOKIE = "guestbook_visitor";

declare global {
  var guestbookVisitInitPromise: Promise<void> | undefined;
  var guestbookVisitPool: Pool | undefined;
}

type VisitStatsRow = {
  page_views: number | string;
  unique_visitors: number | string;
};

export type GuestbookVisitStats = {
  pageViews: number;
  uniqueVisitors: number;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("缺少 DATABASE_URL 环境变量，无法连接访问统计数据库。");
  }

  return databaseUrl;
}

function getGuestbookVisitPool() {
  if (!globalThis.guestbookVisitPool) {
    globalThis.guestbookVisitPool = new Pool({
      connectionString: getDatabaseUrl(),
      idleTimeoutMillis: 10_000,
      max: 2,
    });
  }

  return globalThis.guestbookVisitPool;
}

async function ensureGuestbookVisitTables() {
  if (!globalThis.guestbookVisitInitPromise) {
    const pool = getGuestbookVisitPool();

    globalThis.guestbookVisitInitPromise = pool
      .query(
        `
        CREATE TABLE IF NOT EXISTS guestbook_daily_visit_stats (
          visit_date DATE PRIMARY KEY,
          page_views BIGINT NOT NULL DEFAULT 0,
          unique_visitors BIGINT NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS guestbook_daily_visitors (
          visit_date DATE NOT NULL,
          visitor_hash CHAR(64) NOT NULL,
          first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (visit_date, visitor_hash)
        );
      `,
      )
      .then(() => undefined);
  }

  return globalThis.guestbookVisitInitPromise;
}

function toGuestbookVisitStats(row: VisitStatsRow): GuestbookVisitStats {
  return {
    pageViews: Number(row.page_views),
    uniqueVisitors: Number(row.unique_visitors),
  };
}

export async function recordGuestbookVisit(
  visitorHash: string,
): Promise<GuestbookVisitStats> {
  await ensureGuestbookVisitTables();

  const pool = getGuestbookVisitPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query<VisitStatsRow>(
      `
        WITH current_day AS (
          SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')::date AS visit_date
        ),
        new_visitor AS (
          INSERT INTO guestbook_daily_visitors (visit_date, visitor_hash)
          SELECT visit_date, $1
          FROM current_day
          ON CONFLICT DO NOTHING
          RETURNING visit_date
        )
        INSERT INTO guestbook_daily_visit_stats (
          visit_date,
          page_views,
          unique_visitors
        )
        SELECT
          visit_date,
          1,
          CASE WHEN EXISTS (SELECT 1 FROM new_visitor) THEN 1 ELSE 0 END
        FROM current_day
        ON CONFLICT (visit_date) DO UPDATE
        SET
          page_views = guestbook_daily_visit_stats.page_views + 1,
          unique_visitors = guestbook_daily_visit_stats.unique_visitors +
            EXCLUDED.unique_visitors
        RETURNING page_views, unique_visitors;
      `,
      [visitorHash],
    );

    await client.query("COMMIT");

    return toGuestbookVisitStats(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
