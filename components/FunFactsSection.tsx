// components/FunFactsSection.tsx
// components/FunFactsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { comicFunFacts } from "@/mockData/fun-facts";
import styles from "./FunFactsSection.module.css";

export default function FunFactsSection() {
  // ✅ deterministic initial value (same on server + client)
  const [index, setIndex] = useState(0);

  // After mount on the client, pick a random fact
  useEffect(() => {
    if (comicFunFacts.length > 1) {
      const rand = Math.floor(Math.random() * comicFunFacts.length);
      setIndex(rand);
    }
  }, []);

  function showNewFact() {
    setIndex((prev) => {
      if (comicFunFacts.length <= 1) return prev;
      let next = prev;
      while (next === prev) {
        next = Math.floor(Math.random() * comicFunFacts.length);
      }
      return next;
    });
  }

  const fact = comicFunFacts[index]?.fact ?? "No facts available.";

  return (
    <section className={styles.funFacts}>
      <h2>Did you know?</h2>
      <p>{fact}</p>
      <button className={styles.ffButton} onClick={showNewFact}>
        Show Another Fun Fact
      </button>
    </section>
  );
}
