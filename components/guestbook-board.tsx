"use client";

import { type FormEvent, useEffect, useState } from "react";

import styles from "@/app/blog.module.css";
import {
  type GuestbookMessage,
  type GuestbookSortOrder,
  MAX_GUESTBOOK_CONTENT_LENGTH,
  MAX_GUESTBOOK_MESSAGES,
  MAX_GUESTBOOK_NICKNAME_LENGTH,
} from "@/lib/guestbook-shared";

type GuestbookApiResponse = {
  error?: string;
  maxMessages?: number;
  messages?: GuestbookMessage[];
  ok?: boolean;
};

function formatGuestbookTime(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

async function fetchGuestbookMessages(order: GuestbookSortOrder) {
  const response = await fetch(`/api/guestbook?order=${order}`, {
    cache: "no-store",
  });
  const data = (await response.json()) as GuestbookApiResponse;

  if (!response.ok || !data.messages) {
    throw new Error(data.error ?? "留言读取失败。");
  }

  return data.messages;
}

export function GuestbookBoard() {
  const [content, setContent] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [nickname, setNickname] = useState("");
  const [sortOrder, setSortOrder] = useState<GuestbookSortOrder>("desc");

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        const nextMessages = await fetchGuestbookMessages(sortOrder);

        if (cancelled) {
          return;
        }

        setMessages(nextMessages);
        setFeedback("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setFeedback(error instanceof Error ? error.message : "留言读取失败。");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [sortOrder]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    try {
      const response = await fetch("/api/guestbook", {
        body: JSON.stringify({
          content,
          nickname,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as GuestbookApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "留言发布失败。");
      }

      setContent("");
      setFeedback("留言已发布。");
      setIsLoading(true);
      setMessages(await fetchGuestbookMessages(sortOrder));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "留言发布失败。");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("这条留言会立刻删除，确定继续吗？");

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setFeedback("");

    try {
      const response = await fetch(`/api/guestbook/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as GuestbookApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "删除失败。");
      }

      setFeedback("留言已删除。");
      setIsLoading(true);
      setMessages(await fetchGuestbookMessages(sortOrder));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "删除失败。");
    } finally {
      setDeletingId(null);
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.guestbookSection}>
      <div className={styles.guestbookCard}>
        <div className={styles.guestbookToolbar}>
          <div>
            <p className={styles.sectionCaption}>留言列表</p>
            <p className={styles.guestbookHelperText}>
              匿名可发，最多保留最新 {MAX_GUESTBOOK_MESSAGES} 条。任何人都可以删除。
            </p>
          </div>

          <div className={styles.guestbookSortGroup}>
            <button
              type="button"
              className={`${styles.guestbookSortButton} ${
                sortOrder === "desc" ? styles.guestbookSortButtonActive : ""
              }`}
              onClick={() => {
                setFeedback("");
                setIsLoading(true);
                setSortOrder("desc");
              }}
            >
              最新在前
            </button>
            <button
              type="button"
              className={`${styles.guestbookSortButton} ${
                sortOrder === "asc" ? styles.guestbookSortButtonActive : ""
              }`}
              onClick={() => {
                setFeedback("");
                setIsLoading(true);
                setSortOrder("asc");
              }}
            >
              最早在前
            </button>
          </div>
        </div>

        <form className={styles.guestbookForm} onSubmit={handleSubmit}>
          <label className={styles.guestbookField}>
            <span>昵称</span>
            <input
              className={styles.guestbookInput}
              maxLength={MAX_GUESTBOOK_NICKNAME_LENGTH}
              placeholder="给自己起个名字"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>

          <label className={styles.guestbookField}>
            <span>留言内容</span>
            <textarea
              className={styles.guestbookTextarea}
              maxLength={MAX_GUESTBOOK_CONTENT_LENGTH}
              placeholder="写点想说的话，支持纯文本。"
              rows={6}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          <div className={styles.guestbookFormFooter}>
            <p className={styles.guestbookHelperText}>
              昵称最多 {MAX_GUESTBOOK_NICKNAME_LENGTH} 个字，留言最多{" "}
              {MAX_GUESTBOOK_CONTENT_LENGTH} 个字。
            </p>
            <button
              type="submit"
              className={styles.guestbookSubmitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "发布中..." : "发布留言"}
            </button>
          </div>
        </form>

        {feedback ? <p className={styles.guestbookFeedback}>{feedback}</p> : null}

        {isLoading ? (
          <p className={styles.guestbookEmptyState}>正在读取留言...</p>
        ) : messages.length === 0 ? (
          <p className={styles.guestbookEmptyState}>还没有人留言，你可以先写第一条。</p>
        ) : (
          <ul className={styles.guestbookList}>
            {messages.map((message) => (
              <li key={message.id} className={styles.guestbookListItem}>
                <div className={styles.guestbookListHeader}>
                  <div className={styles.guestbookMeta}>
                    <strong className={styles.guestbookNickname}>
                      {message.nickname}
                    </strong>
                    <span className={styles.guestbookTime}>
                      {formatGuestbookTime(message.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.guestbookDeleteButton}
                    disabled={deletingId === message.id}
                    onClick={() => handleDelete(message.id)}
                  >
                    {deletingId === message.id ? "删除中..." : "删除"}
                  </button>
                </div>
                <p className={styles.guestbookContent}>{message.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
