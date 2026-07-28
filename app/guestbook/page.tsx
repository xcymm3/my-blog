import type { Metadata } from "next";

import styles from "@/app/blog.module.css";
import { GuestbookBoard } from "@/components/guestbook-board";
import { GuestbookVisitStats } from "@/components/guestbook-visit-stats";
import { SiteShell } from "@/components/site-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "留言",
};

export default function GuestbookPage() {
  return (
    <SiteShell navKey="guestbook">
      <main className={styles.main}>
        <section className={styles.pageContainer}>
          <div className={styles.infoCard}>
            <p className={styles.sectionCaption}>留言</p>
            <div className={styles.infoCardHeading}>
              <h1 className={styles.infoCardTitle}>留言板</h1>
              <GuestbookVisitStats />
            </div>
            <p className={styles.infoCardText}>{siteConfig.guestbookIntro}</p>
            <p className={styles.infoCardText}>
              默认保留最新 100 条，支持按时间正序或倒序查看。
            </p>
          </div>

          <GuestbookBoard />
        </section>
      </main>
    </SiteShell>
  );
}
