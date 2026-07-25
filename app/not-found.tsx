import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

import styles from "./blog.module.css";

export default function NotFound() {
  return (
    <SiteShell navKey="home">
      <main className={styles.main}>
        <section className={styles.pageContainer}>
          <div className={styles.infoCard}>
            <p className={styles.sectionCaption}>404</p>
            <h1 className={styles.infoCardTitle}>这篇内容不在当前索引中。</h1>
            <p className={styles.infoCardText}>
              这里目前只保留已经发布的文章路径。你可以先回到首页，再从最新文章或文章列表里重新进入。
            </p>
            <Link href="/" className={styles.readMoreLink}>
              返回首页
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
