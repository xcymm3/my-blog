import { PostPreviewCard } from "@/components/post-preview-card";
import { SiteShell } from "@/components/site-shell";
import { getLatestPost } from "@/lib/posts";

import styles from "./blog.module.css";

export default function Home() {
  const latestPost = getLatestPost();

  return (
    <SiteShell navKey="home">
      <main className={styles.main}>
        <section className={styles.pageContainer}>
          <PostPreviewCard post={latestPost} topLabel="最新文章" />
        </section>
      </main>
    </SiteShell>
  );
}
