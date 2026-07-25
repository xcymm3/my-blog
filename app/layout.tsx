import "./globals.css";

import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    description: siteConfig.description,
    title: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    description: siteConfig.description,
    title: siteConfig.name,
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
