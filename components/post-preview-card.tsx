import Link from "next/link";

import styles from "@/app/blog.module.css";
import { formatDate, type Post } from "@/lib/posts";

type PostPreviewCardProps = {
  post: Post;
  topLabel?: string;
};

export function PostPreviewCard({ post, topLabel }: PostPreviewCardProps) {
  return (
    <article className={styles.postCard}>
      {topLabel ? (
        <div className={styles.cardTopBar}>
          <span className={styles.cardTopLabel}>{topLabel}</span>
          <span className={styles.cardTopDate}>
            发布日期：{formatDate(post.publishedAt)}
          </span>
        </div>
      ) : null}

      <div className={styles.postCardHeader}>
        <h2 className={styles.postCardTitle}>
          <Link href={`/posts/${post.slug}`} className={styles.titleLink}>
            {post.title}
          </Link>
        </h2>
        <div className={styles.postCardMeta}>
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.tags.join(" · ")}</span>
          <span>预计阅读 {post.readingTime}</span>
        </div>
      </div>

      <div className={styles.postCardDivider} />

      <div className={styles.postCardQuote}>
        <p>{post.intro}</p>
      </div>

      <div
        className={`${styles.articleBody} ${styles.postCardBody}`}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
