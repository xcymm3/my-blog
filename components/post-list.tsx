import styles from "@/app/blog.module.css";
import type { Post } from "@/lib/posts";

import { PostPreviewCard } from "./post-preview-card";

type PostListProps = {
  posts: Post[];
};

export function PostList({ posts }: PostListProps) {
  return (
    <ul className={styles.postGrid}>
      {posts.map((post) => (
        <li key={post.slug}>
          <PostPreviewCard post={post} />
        </li>
      ))}
    </ul>
  );
}
