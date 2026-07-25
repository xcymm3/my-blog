import type { Metadata } from "next";

import styles from "@/app/blog.module.css";
import { PostList } from "@/components/post-list";
import { SiteShell } from "@/components/site-shell";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章",
};

export default function ArticlesPage() {
  const posts = getPosts();

  return (
    <SiteShell navKey="articles">
      <main className={styles.main}>
        <section className={styles.pageContainer}>
          <div className={styles.sectionCaption}>全部文章</div>
          <PostList posts={posts} />
        </section>
      </main>
    </SiteShell>
  );
}
