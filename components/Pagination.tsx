"use client";

import Link from "next/link";
import styles from "./Pagination.module.css";

export default function Pagination({
  page,
  query,
  basePath,
  hasNext,
}: {
  page: number;
  query?: string;
  basePath: string; // "/browse" or "/search"
  hasNext: boolean; // if more results
}) {
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasNext ? page + 1 : null;

  const buildHref = (p: number) => {
    const q = query ? `&q=${encodeURIComponent(query)}` : "";
    return `${basePath}?page=${p}${q}`;
  };

  return (
    <nav className={styles.pagination}>
      {prevPage ? (
        <Link href={buildHref(prevPage)} className={styles.pageButton}>
          ◀ Previous
        </Link>
      ) : (
        <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`}>
          ◀ Previous
        </span>
      )}

      {nextPage ? (
        <Link href={buildHref(nextPage)} className={styles.pageButton}>
          Next ▶
        </Link>
      ) : (
        <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`}>
          Next ▶
        </span>
      )}
    </nav>
  );
}
