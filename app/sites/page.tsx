import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/app/blog.module.css";
import { SiteShell } from "@/components/site-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "网站",
};

export default function SitesPage() {
  const totalProjects = siteConfig.projectGroups.reduce(
    (total, group) => total + group.projects.length,
    0,
  );

  return (
    <SiteShell navKey="sites">
      <main className={styles.main}>
        <section className={styles.pageContainer}>
          <div className={styles.infoCard}>
            <p className={styles.sectionCaption}>网站</p>
            <h1 className={styles.infoCardTitle}>个人作品集</h1>
            <p className={styles.infoCardText}>{siteConfig.siteIntro}</p>
            <p className={styles.projectTotal}>目前共 {totalProjects} 个项目</p>

            <div className={styles.githubProfile}>
              <Link
                href={siteConfig.githubProfile.href}
                className={styles.siteListLink}
                rel="noreferrer"
                target="_blank"
              >
                {siteConfig.githubProfile.label}
              </Link>
              <p className={styles.siteListNote}>{siteConfig.githubProfile.note}</p>
            </div>

            <div className={styles.projectGroups}>
              {siteConfig.projectGroups.map((group) => (
                <details key={group.label} className={styles.projectGroup}>
                  <summary className={styles.projectGroupSummary}>
                    <span>{group.label}</span>
                    <span>{group.projects.length} 个项目</span>
                  </summary>
                  <ul className={styles.siteList}>
                    {group.projects.map((project) => (
                      <li key={project.href} className={styles.siteListItem}>
                        <Link
                          href={project.href}
                          className={styles.siteListLink}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {project.label}
                        </Link>
                        <p className={styles.siteListNote}>{project.note}</p>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <p className={styles.infoCardText}>{siteConfig.siteNote}</p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
