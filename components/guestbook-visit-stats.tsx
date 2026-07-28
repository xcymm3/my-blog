"use client";

import { useEffect, useState } from "react";

import styles from "@/app/blog.module.css";

type GuestbookVisitStats = {
  pageViews: number;
  uniqueVisitors: number;
};

export function GuestbookVisitStats() {
  const [stats, setStats] = useState<GuestbookVisitStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function recordVisit() {
      try {
        const response = await fetch("/api/guestbook/visits", {
          cache: "no-store",
          method: "POST",
        });

        if (!response.ok) {
          return;
        }

        const nextStats = (await response.json()) as GuestbookVisitStats;

        if (!cancelled) {
          setStats(nextStats);
        }
      } catch {
        // 统计失败不影响留言板的正常使用。
      }
    }

    void recordVisit();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p className={styles.guestbookVisitStats} aria-live="polite">
      今日浏览人数 {stats?.uniqueVisitors ?? "--"}，浏览次数 {stats?.pageViews ?? "--"}
    </p>
  );
}
