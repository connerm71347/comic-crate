// app/page.tsx
import Link from "next/link";
import ComicCard from "@/components/ComicCard";
import styles from "./page.module.css";
import { cvFetch, cvUrl } from "@/db/comicvine";
import FunFactsSection from "@/components/FunFactsSection";

type CVSearchResp = {
  status_code: number;
  results?: {
    id: number;
    name: string;
    deck?: string;
    start_year?: string;
    publisher?: { name?: string };
    image?: {
      small_url?: string;
      medium_url?: string;
      super_url?: string;
    };
  }[];
};

async function getFeatured() {
  const queries = ["batman", "spider-man", "x-men"];
  const all: {
    id: number;
    title: string;
    description: string;
    cover: string;
    publisher: string;
    year: string;
  }[] = [];

  for (const q of queries) {
    const url = cvUrl("search/", {
      query: q,
      resources: "volume",
      limit: 5,
      field_list: "id,name,deck,start_year,publisher,image",
    });

    const data = await cvFetch<CVSearchResp>(url);
    if (data.status_code === 1 && data.results) {
      for (const r of data.results) {
        all.push({
          id: r.id,
          title: r.name,
          description: r.deck || "",
          cover:
            r.image?.super_url ||
            r.image?.medium_url ||
            r.image?.small_url ||
            "",
          publisher: r.publisher?.name || "",
          year: r.start_year || "",
        });
      }
    }
  }

  // ✅ de-dupe and keep ONLY 4
  const map = new Map<number, (typeof all)[number]>();
  for (const item of all) map.set(item.id, item);
  return Array.from(map.values()).slice(0, 5);
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <main className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Welcome to Comic Crate!</h1>
        <p>
          Your personal comic library. Track, review, and collect your favorite
          comics all in one place.
        </p>
        <Link href="/browse" className={styles.ctaButton}>
          Browse Comics
        </Link>
      </section>

      {/* Featured from ComicVine */}
      <section className={styles.featured}>
        <h2>Featured Volumes</h2>
        {featured.length ? (
          <div className={styles.featuredGrid}>
            {featured.map((c) => (
              <ComicCard
                key={c.id}
                comic={{
                  id: c.id,
                  title: c.title,
                  author: c.publisher || "—",
                  cover: c.cover,
                  year: Number(c.year) || 0,
                  description: c.description,
                }}
              />
            ))}
          </div>
        ) : (
          <p>
            Could not load featured comics right now. Try searching using the
            bar above.
          </p>
        )}
      </section>

      {/* 🔥 Fun Facts Section (client component) */}
      <FunFactsSection />
    </main>
  );
}
