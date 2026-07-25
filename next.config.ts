import type { NextConfig } from "next";

const repoName = "my-blog";
const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  basePath: isGithubPagesBuild ? `/${repoName}` : "",
  images: {
    unoptimized: true,
  },
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
