import { NextRequest, NextResponse } from "next/server";

import { createGuestbookMessage, listGuestbookMessages } from "@/lib/guestbook";
import {
  isGuestbookSortOrder,
  MAX_GUESTBOOK_CONTENT_LENGTH,
  MAX_GUESTBOOK_MESSAGES,
  MAX_GUESTBOOK_NICKNAME_LENGTH,
} from "@/lib/guestbook-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GuestbookPostBody = {
  content?: string;
  nickname?: string;
};

function jsonResponse(body: Record<string, unknown>, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");

  return response;
}

function normalizeNickname(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeContent(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  const requestedOrder = request.nextUrl.searchParams.get("order");
  const order = isGuestbookSortOrder(requestedOrder) ? requestedOrder : "desc";

  try {
    const messages = await listGuestbookMessages(order);

    return jsonResponse({
      maxMessages: MAX_GUESTBOOK_MESSAGES,
      messages,
      order,
    });
  } catch (error) {
    console.error("读取留言失败", error);

    return jsonResponse(
      {
        error: "留言读取失败，请稍后再试。",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: GuestbookPostBody;

  try {
    body = (await request.json()) as GuestbookPostBody;
  } catch {
    return jsonResponse(
      {
        error: "请求格式不正确。",
      },
      { status: 400 },
    );
  }

  const nickname = normalizeNickname(body.nickname);
  const content = normalizeContent(body.content);

  if (!nickname) {
    return jsonResponse(
      {
        error: "请先填写昵称。",
      },
      { status: 400 },
    );
  }

  if (!content) {
    return jsonResponse(
      {
        error: "请先填写留言内容。",
      },
      { status: 400 },
    );
  }

  if (nickname.length > MAX_GUESTBOOK_NICKNAME_LENGTH) {
    return jsonResponse(
      {
        error: `昵称不能超过 ${MAX_GUESTBOOK_NICKNAME_LENGTH} 个字。`,
      },
      { status: 400 },
    );
  }

  if (content.length > MAX_GUESTBOOK_CONTENT_LENGTH) {
    return jsonResponse(
      {
        error: `留言内容不能超过 ${MAX_GUESTBOOK_CONTENT_LENGTH} 个字。`,
      },
      { status: 400 },
    );
  }

  try {
    const message = await createGuestbookMessage({ content, nickname });

    return jsonResponse(
      {
        message,
        ok: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("写入留言失败", error);

    return jsonResponse(
      {
        error: "留言发布失败，请稍后再试。",
      },
      { status: 500 },
    );
  }
}
