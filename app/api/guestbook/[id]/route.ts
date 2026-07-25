import { NextResponse } from "next/server";

import { deleteGuestbookMessage } from "@/lib/guestbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeleteRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function jsonResponse(body: Record<string, unknown>, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");

  return response;
}

export async function DELETE(_request: Request, { params }: DeleteRouteContext) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return jsonResponse(
      {
        error: "留言编号无效。",
      },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteGuestbookMessage(numericId);

    if (!deleted) {
      return jsonResponse(
        {
          error: "这条留言不存在，可能已经被删除。",
        },
        { status: 404 },
      );
    }

    return jsonResponse({
      ok: true,
    });
  } catch (error) {
    console.error("删除留言失败", error);

    return jsonResponse(
      {
        error: "删除留言失败，请稍后再试。",
      },
      { status: 500 },
    );
  }
}
