export const MAX_GUESTBOOK_MESSAGES = 100;
export const MAX_GUESTBOOK_CONTENT_LENGTH = 500;
export const MAX_GUESTBOOK_NICKNAME_LENGTH = 24;

export type GuestbookSortOrder = "asc" | "desc";

export type GuestbookMessage = {
  content: string;
  createdAt: string;
  id: number;
  nickname: string;
};

export function isGuestbookSortOrder(
  value: string | null | undefined,
): value is GuestbookSortOrder {
  return value === "asc" || value === "desc";
}
