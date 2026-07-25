import Link from "next/link";
import type { ReactNode } from "react";

import styles from "@/app/blog.module.css";
import { siteConfig } from "@/lib/site";

type SiteShellProps = {
  children: ReactNode;
  navKey: "articles" | "guestbook" | "home" | "sites";
};

const navItems = [
  {
    href: "/",
    key: "home",
    label: "主页",
  },
  {
    href: "/articles",
    key: "articles",
    label: "文章",
  },
  {
    href: "/sites",
    key: "sites",
    label: "网站",
  },
  {
    href: "/guestbook",
    key: "guestbook",
    label: "留言",
  },
] as const;

export function SiteShell({ children, navKey }: SiteShellProps) {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.masthead}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.wordmark}>
              {siteConfig.name}
            </Link>

            <nav aria-label="主导航">
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${
                        item.key === navKey ? styles.navLinkActive : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
