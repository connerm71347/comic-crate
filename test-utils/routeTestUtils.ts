import { NextRequest, NextResponse } from "next/server";

type NextRequestInit = Omit<RequestInit, "signal"> & {
  signal?: AbortSignal;
};

type RouteHandler<TContext = undefined> = (
  req: NextRequest,
  context: TContext
) => Promise<NextResponse> | NextResponse;

type CallRouteOptions<TContext> = {
  method?: string;
  path?: string;
  body?: any;
  headers?: Record<string, string>;
  cookies?: string[];
  context?: TContext;
};

export async function callRoute<TContext = undefined>(
  handler: RouteHandler<TContext>,
  {
    method = "GET",
    path = "/api/test",
    body,
    headers,
    cookies,
    context,
  }: CallRouteOptions<TContext> = {}
) {
  const url = new URL(path, "http://localhost");
  const nextHeaders = new Headers(headers);

  if (cookies?.length) {
    nextHeaders.set("cookie", cookies.join("; "));
  }

  const init: RequestInit = {
    method,
    headers: nextHeaders,
  } satisfies RequestInit;

  if (body !== undefined && method !== "GET" && method !== "HEAD") {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
    if (!nextHeaders.has("content-type")) {
      nextHeaders.set("content-type", "application/json");
    }
  }

  const request = new NextRequest(url.toString(), init as NextRequestInit);
  const response = await handler(
    request,
    (context ?? (undefined as TContext)) as TContext
  );

  const text = await response.text();
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  const responseCookies = response.cookies
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`);

  const headerEntries = Array.from(response.headers.entries()).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  return {
    status: response.status,
    body: json,
    cookies: responseCookies,
    headers: headerEntries,
  };
}
