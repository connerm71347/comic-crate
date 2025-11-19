const BASE =
  process.env.COMICS_API_URL ??
  (() => {
    throw new Error("COMICS_API_URL is not defined");
  })();
const KEY =
  process.env.COMICS_API_KEY ??
  (() => {
    throw new Error("COMICS_API_KEY is not defined");
  })();

export function cvUrl(
  path: string,
  params: Record<string, string | number> = {}
) {
  if (!BASE) throw new Error("Missing COMICVINE_BASE");
  if (!KEY) throw new Error("Missing COMICVINE_API_KEY");

  const base = BASE.endsWith("/") ? BASE : BASE + "/";
  const cleanPath = path.replace(/^\/+/, ""); // <-- strip leading '/'

  const u = new URL(base + cleanPath); // ensures ".../api/search/"
  u.searchParams.set("api_key", KEY);
  u.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  return u.toString();
}

export async function cvFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store", // avoid stale cache during dev
    headers: {
      "User-Agent": "ComicCrate/1.0 (Next.js dev)",
      Accept: "application/json",
    },
    ...init,
  });
  const text = await res.text(); // read body either way
  if (!res.ok) {
    throw new Error(
      `Upstream ${res.status} ${res.statusText}. Body: ${text.slice(0, 400)}`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Non-JSON upstream body: ${text.slice(0, 400)}`);
  }
}
