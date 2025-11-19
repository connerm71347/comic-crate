// app/api/cv/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cvFetch, cvUrl } from "@/db/comicvine";

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const limit = 12;

  if (!q.trim()) {
    return NextResponse.json({ results: [], page, total: 0 });
  }

  const url = cvUrl("search/", {
    query: q,
    resources: "volume",
    limit,
    page,
    field_list:
      "id,name,deck,description,start_year,publisher,image,site_detail_url",
  });

  const data = await cvFetch<{
    status_code: number;
    error?: string;
    results?: Array<{
      id: number;
      name: string;
      deck?: string;
      description?: string;
      start_year?: string;
      publisher?: { name?: string };
      image?: { small_url?: string; medium_url?: string; super_url?: string };
      site_detail_url?: string;
    }>;
  }>(url);

  if (data.status_code !== 1 || !data.results) {
    return NextResponse.json(
      { error: data.error ?? "Upstream error", results: [], page, total: 0 },
      { status: 502 }
    );
  }

  const results = data.results.map((r) => ({
    id: r.id,
    title: r.name,
    description: stripHtml(r.deck || r.description),
    cover:
      r.image?.super_url || r.image?.medium_url || r.image?.small_url || "",
    publisher: r.publisher?.name || "",
    year: r.start_year || "",
    url: r.site_detail_url || "",
  }));

  return NextResponse.json({
    results,
    page,
    total: results.length, // ComicVine doesn't give full total easily, but this is fine for now
  });
}
