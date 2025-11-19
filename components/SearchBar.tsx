"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    // this keeps the search bar synced with the URL
    setQuery(sp.get("q") ?? "");
  }, [sp]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form className={styles.searchContainer} onSubmit={onSubmit}>
      <input
        className={styles.input}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search comics..."
        autoComplete="off"
      />
      <button className={styles.button} type="submit">
        Search
      </button>
    </form>
  );
}
