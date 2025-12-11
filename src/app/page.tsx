import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Next.js</h1>
        <p className={styles.description}>
          Get started by editing <code>src/app/page.tsx</code>
        </p>
        <div className={styles.links}>
          <a
            className={`${styles.link} ${styles.linkPrimary}`}
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
          <a
            className={`${styles.link} ${styles.linkSecondary}`}
            href="https://nextjs.org/learn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn
          </a>
        </div>
      </main>
    </div>
  );
}
