import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/app/blog.module.css";
import { PostList } from "@/components/post-list";
import { SiteShell } from "@/components/site-shell";
import { formatDate, getPostBySlug, getPosts, getRelatedPosts } from "@/lib/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    description: post.intro,
    title: post.title,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug);

  return (
    <SiteShell navKey="articles">
      <main className={styles.main}>
        <div className={styles.pageContainer}>
          <article className={styles.articleCard}>
            <header className={styles.articleHeader}>
              <Link href="/articles" className={styles.backLink}>
                返回文章
              </Link>

              <h1 className={styles.articleTitle}>{post.title}</h1>
              <div className={styles.articleMeta}>
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.tags.join(" · ")}</span>
                <span>预计阅读 {post.readingTime}</span>
              </div>
            </header>

            <div className={styles.postCardDivider} />

            <div className={styles.postCardQuote}>
              <p>{post.intro}</p>
            </div>

            <div
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </article>

          <section className={styles.secondarySection}>
            <div className={styles.sectionCaption}>更多文章</div>
            <PostList posts={relatedPosts} />
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
