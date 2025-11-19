"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ComicCard from "@/components/ComicCard";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";

type Result = {
  id: number;
  title: string;
  description: string;
  cover: string;
  publisher: string;
  year: string;
  url: string;
};

export default function SearchPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = (sp.get("q") ?? "").trim();
  const page = Number(sp.get("page") ?? "1") || 1;

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/cv/search?q=${encodeURIComponent(q)}&page=${page}`
        );
        const data = await res.json();
        if (!ignore) setResults(data.results || []);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [q, page]);

  // function goToPage(nextPage: number) {
  //   const params = new URLSearchParams(Array.from(sp.entries()));
  //   params.set("page", String(nextPage));
  //   router.push(`/search?${params.toString()}`);
  // }

  if (!q) return <p>Type something to search.</p>;
  if (loading) return <Loader />;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>
        Search Results for “{q}” (page {page})
      </h2>

      {results.length ? (
        <>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            }}
          >
            {results.map((item) => (
              <ComicCard
                key={item.id}
                comic={{
                  id: item.id,
                  title: item.title,
                  author: item.publisher || "—",
                  cover: item.cover,
                  year: Number(item.year) || 0,
                  description: item.description,
                }}
              />
            ))}
          </div>

          {/* Pagination controls */}
          <Pagination
            page={page}
            query={q}
            basePath="/search"
            hasNext={results.length > 0}
          />
        </>
      ) : (
        <p>No results for “{q}”. Try another keyword.</p>
      )}
    </div>
  );
}
