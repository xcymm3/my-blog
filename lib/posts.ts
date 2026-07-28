import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const postsDirectory = path.join(process.cwd(), "content", "posts");

type PostFrontmatter = {
  draft?: boolean;
  publishedAt: string;
  tags: string[];
  title: string;
};

export type Post = {
  contentHtml: string;
  draft: boolean;
  publishedAt: string;
  readingTime: string;
  slug: string;
  description: string;
  tags: string[];
  title: string;
};

type ParsedPostFile = Omit<Post, "contentHtml"> & {
  content: string;
  fileName: string;
};

function createSlug(rawValue: string) {
  return rawValue
    .trim()
    .toLowerCase()
    .replace(/\.md$/i, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function readPostFileNames() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();
}

function normalizeDateValue(value: unknown, fieldName: string, slug: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  throw new Error(`文章 "${slug}" 的 ${fieldName} 必须是有效日期字符串。`);
}

function normalizeStringValue(value: unknown, fieldName: string, slug: string) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw new Error(`文章 "${slug}" 的 ${fieldName} 必须是非空字符串。`);
}

function normalizeTags(value: unknown, slug: string) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`文章 "${slug}" 的 tags 必须是非空字符串数组。`);
  }

  const tags = value.map((item) => normalizeStringValue(item, "tags", slug));

  return [...new Set(tags)];
}

function normalizeFrontmatter(
  data: Record<string, unknown>,
  slug: string,
): PostFrontmatter {
  return {
    draft: typeof data.draft === "boolean" ? data.draft : false,
    publishedAt: normalizeDateValue(data.publishedAt, "publishedAt", slug),
    tags: normalizeTags(data.tags, slug),
    title: normalizeStringValue(data.title, "title", slug),
  };
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateReadingTime(markdown: string) {
  const plainText = stripMarkdown(markdown);
  const cjkCount = (plainText.match(/[\p{Script=Han}]/gu) ?? []).length;
  const wordCount = (plainText.match(/[A-Za-z0-9]+/g) ?? []).length;
  const estimatedUnits = cjkCount + wordCount * 2;
  const minutes = Math.max(1, Math.ceil(estimatedUnits / 300));

  return `${minutes} 分钟`;
}

function createDescription(markdown: string) {
  return stripMarkdown(markdown).slice(0, 160);
}

function parsePostFile(fileName: string): ParsedPostFile {
  const slug = createSlug(fileName);
  const filePath = path.join(postsDirectory, fileName);
  const rawFile = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(rawFile);
  const frontmatter = normalizeFrontmatter(data, slug);

  return {
    content: content.trim(),
    draft: frontmatter.draft ?? false,
    description: createDescription(content),
    fileName,
    publishedAt: frontmatter.publishedAt,
    readingTime: calculateReadingTime(content),
    slug,
    tags: frontmatter.tags,
    title: frontmatter.title,
  };
}

function renderMarkdown(markdown: string) {
  return remark().use(remarkGfm).use(remarkHtml).processSync(markdown).toString();
}

export function formatDate(date: string) {
  return date;
}

export function getPosts() {
  return readPostFileNames()
    .map(parsePostFile)
    .filter((post) => !post.draft)
    .sort((left, right) => (left.publishedAt < right.publishedAt ? 1 : -1))
    .map(({ content, fileName: _fileName, ...post }) => ({
      ...post,
      contentHtml: renderMarkdown(content),
    }));
}

export function getLatestPost() {
  const latestPost = getPosts()[0];

  if (!latestPost) {
    throw new Error("未找到已发布文章，请先在 content/posts 中新增 Markdown 文章。");
  }

  return latestPost;
}

export function getPostBySlug(slug: string) {
  const normalizedSlug = createSlug(slug);
  const parsedPost = readPostFileNames()
    .map(parsePostFile)
    .find((post) => post.slug === normalizedSlug);

  if (!parsedPost || parsedPost.draft) {
    return undefined;
  }

  const { content, fileName: _fileName, ...post } = parsedPost;

  return {
    ...post,
    contentHtml: renderMarkdown(content),
  } satisfies Post;
}

export function getRelatedPosts(slug: string) {
  return getPosts()
    .filter((post) => post.slug !== slug)
    .slice(0, 2);
}
