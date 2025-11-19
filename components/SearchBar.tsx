"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const current = sp.get("q") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery((prev) => (prev === current ? prev : current));
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
