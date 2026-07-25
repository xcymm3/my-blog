import type { Metadata } from "next";

import styles from "@/app/blog.module.css";
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
            <h1 className={styles.infoCardTitle}>
              这里以后可以放评论、表单或联系方式。
            </h1>
            <p className={styles.infoCardText}>{siteConfig.guestbookIntro}</p>
            <p className={styles.infoCardText}>
              如果你暂时只想保留一个安静的占位页，这个版本已经足够自然，不会破坏首页的整体风格。
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
