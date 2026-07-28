import { createHash, randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { GUESTBOOK_VISITOR_COOKIE, recordGuestbookVisit } from "@/lib/guestbook-visits";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VISITOR_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function hashVisitorId(visitorId: string) {
  return createHash("sha256").update(visitorId).digest("hex");
}

export async function POST(request: NextRequest) {
  const existingVisitorId = request.cookies.get(GUESTBOOK_VISITOR_COOKIE)?.value;
  const visitorId =
    existingVisitorId && VISITOR_ID_PATTERN.test(existingVisitorId)
      ? existingVisitorId
      : randomUUID();
  const stats = await recordGuestbookVisit(hashVisitorId(visitorId));
  const response = NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store",
    },
  });

  if (visitorId !== existingVisitorId) {
    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      name: GUESTBOOK_VISITOR_COOKIE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: visitorId,
    });
  }

  return response;
}
