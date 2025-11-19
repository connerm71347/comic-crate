// app/browse/page.tsx
import ComicCard from "@/components/ComicCard";
import { cvFetch, cvUrl } from "@/db/comicvine";
import Pagination from "@/components/Pagination";

type CVSearchResp = {
  status_code: number;
  error?: string;
  results?: {
    id: number;
    name: string;
    deck?: string;
    description?: string;
    start_year?: string;
    publisher?: { name?: string };
    image?: {
      small_url?: string;
      medium_url?: string;
      super_url?: string;
    };
  }[];
};

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  // 🔑 FIX: await the Promise
  const sp = await searchParams;

  const page = Number(sp.page ?? "1") || 1;
  const q = (sp.q ?? "comics").trim() || "comics";
  const limit = 12;

  const url = cvUrl("search/", {
    query: q,
    resources: "volume",
    limit,
    page,
    field_list:
      "id,name,deck,description,start_year,publisher,image,site_detail_url",
  });

  let items: {
    id: number;
    title: string;
    description: string;
    cover: string;
    publisher: string;
    year: string;
  }[] = [];

  try {
    const data = await cvFetch<CVSearchResp>(url);

    if (data.status_code === 1 && data.results) {
      items = data.results.map((r) => ({
        id: r.id,
        title: r.name,
        description: stripHtml(r.deck || r.description || ""),
        cover:
          r.image?.super_url || r.image?.medium_url || r.image?.small_url || "",
        publisher: r.publisher?.name || "",
        year: r.start_year || "",
      }));
    }
  } catch (err) {
    console.error("[Browse] ComicVine error:", err);
  }

  const hasResults = items.length > 0;

  // If you're still fighting CSS modules here, you can temporarily use inline styles like this:
  return (
    <main style={{ padding: "2rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1>Browse Comics</h1>
        <p>
          Showing volumes for <strong>&quot;{q}&quot;</strong> — page {page}
        </p>
      </header>

      {hasResults ? (
        <>
          <section
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            {items.map((item) => (
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
          </section>

          <Pagination
            page={page}
            query={q}
            basePath="/browse"
            hasNext={hasResults}
          />
        </>
      ) : (
        <p style={{ marginTop: "2rem", textAlign: "center" }}>
          No results found. Try searching for a specific title instead.
        </p>
      )}
    </main>
  );
}
