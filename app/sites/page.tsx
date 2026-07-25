import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/app/blog.module.css";
import { SiteShell } from "@/components/site-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "网站",
};

export default function SitesPage() {
  return (
    <SiteShell navKey="sites">
      <main className={styles.main}>
        <section className={styles.pageContainer}>
          <div className={styles.infoCard}>
            <p className={styles.sectionCaption}>网站</p>
            <h1 className={styles.infoCardTitle}>个人作品集</h1>
            <p className={styles.infoCardText}>{siteConfig.siteIntro}</p>
            <ul className={styles.siteList}>
              {siteConfig.websiteLinks.map((item) => (
                <li key={item.href} className={styles.siteListItem}>
                  <Link
                    href={item.href}
                    className={styles.siteListLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.label}
                  </Link>
                  <p className={styles.siteListNote}>{item.note}</p>
                </li>
              ))}
            </ul>
            <p className={styles.infoCardText}>{siteConfig.siteNote}</p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
