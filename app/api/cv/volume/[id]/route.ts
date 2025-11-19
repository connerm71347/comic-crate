// app/api/cv/volume/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cvFetch, cvUrl } from "../../../../../db/comicvine";

function volumePath(id: string | number) {
  return `volume/4050-${id}/`;
}

type CVVolumeResp = {
  status_code: number;
  error?: string;
  results?: {
    id: number;
    name: string;
    deck?: string;
    publisher?: { name?: string };
    start_year?: string;
    image?: { small_url?: string; medium_url?: string; super_url?: string };
    site_detail_url?: string;
  };
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // 👈 params is a Promise here
) {
  const { id } = await ctx.params; // 👈 await it
  const url = cvUrl(volumePath(id), {
    field_list: "id,name,deck,publisher,start_year,image,site_detail_url",
  });

  try {
    const data = await cvFetch<CVVolumeResp>(url);
    if (data.status_code !== 1 || !data.results) {
      return NextResponse.json(
        { upstream_error: data.error ?? "Unknown error", url },
        { status: 502 }
      );
    }
    const r = data.results;
    const result = {
      id: r.id,
      title: r.name,
      description: r.deck || "",
      cover:
        r.image?.super_url || r.image?.medium_url || r.image?.small_url || "",
      publisher: r.publisher?.name || "",
      year: r.start_year || "",
      url: r.site_detail_url || "",
    };
    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
