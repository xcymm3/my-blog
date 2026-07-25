# 我的博客

一个使用 Next.js、React 和 pnpm 搭建的极简个人博客起步项目。

## 已包含内容

- 一个以写作为中心的中文博客首页
- 基于 `content/posts/*.md` 生成的静态文章详情页
- 集中管理的设计变量文件 `tokens.css`
- 已接入 ESLint、Prettier、导入排序和未使用导入清理

## 常用脚本

```bash
pnpm dev
pnpm build
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck
pnpm check
```

## 主要修改位置

- `lib/site.ts`：站点名称、简介和页面元数据
- `content/posts`：博客文章 Markdown 源文件
- `lib/posts.ts`：读取 Markdown、解析 front matter、生成文章数据
- `app/blog.module.css`：页面布局与文章样式
- `tokens.css`：颜色、间距、字号比例和动效变量
