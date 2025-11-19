/**
 * @jest-environment node
 *
 * Covers auth and shelf management APIs using the Next route handlers, backed
 * by lightweight in-memory mocks so the tests don't depend on Mongo sockets.
 */

import { callRoute } from "@/test-utils/routeTestUtils";
import { resetMockDb } from "@/test-utils/mockDbState";

jest.mock("@/helpers/mailer", () => ({
  sendEmail: jest.fn(),
}));
jest.mock("@/db/dbConfig", () => ({
  connectToDB: jest.fn(),
}));
jest.mock("@/models/userModel", () => require("@/test-utils/mockUserModel").default);

type SignupRoute = typeof import("@/app/api/users/signup/route").POST;
type LoginRoute = typeof import("@/app/api/users/login/route").POST;
type MeRoute = typeof import("@/app/api/users/me/route").GET;
type ShelvesPostRoute = typeof import("@/app/api/users/shelves/route").POST;
type ShelvesDeleteRoute = typeof import("@/app/api/users/shelves/route").DELETE;

let signupRoute: SignupRoute;
let loginRoute: LoginRoute;
let meRoute: MeRoute;
let shelvesPostRoute: ShelvesPostRoute;
let shelvesDeleteRoute: ShelvesDeleteRoute;

let userCounter = 0;
function makeCreds() {
  userCounter += 1;
  return {
    username: `tester${userCounter}`,
    email: `tester${userCounter}@test.com`,
    password: "P@ssw0rd!",
  };
}

async function signupAndLogin() {
  const creds = makeCreds();
  const signupRes = await callRoute(signupRoute, {
    method: "POST",
    path: "/api/users/signup",
    body: creds,
  });

  if (signupRes.status >= 400) {
    throw new Error(`Signup failed: ${JSON.stringify(signupRes.body)}`);
  }

  const loginRes = await callRoute(loginRoute, {
    method: "POST",
    path: "/api/users/login",
    body: { email: creds.email, password: creds.password },
  });

  return { creds, loginRes };
}

beforeAll(async () => {
  process.env.TOKEN_SECRET = "test-secret";
  ({ POST: signupRoute } = await import("@/app/api/users/signup/route"));
  ({ POST: loginRoute } = await import("@/app/api/users/login/route"));
  ({ GET: meRoute } = await import("@/app/api/users/me/route"));
  const shelvesModule = await import("@/app/api/users/shelves/route");
  shelvesPostRoute = shelvesModule.POST;
  shelvesDeleteRoute = shelvesModule.DELETE;
});

afterEach(async () => {
  resetMockDb();
  jest.clearAllMocks();
  userCounter = 0;
});

describe("Auth routes", () => {
  test("POST /api/users/signup creates a user", async () => {
    const creds = makeCreds();
    const res = await callRoute(signupRoute, {
      method: "POST",
      path: "/api/users/signup",
      body: creds,
    });

    expect(res.status).toBe(200);
    expect(res.body?.savedUser?.email).toBe(creds.email);
  });

  test("POST /api/users/login issues a token cookie", async () => {
    const { creds } = await signupAndLogin();
    const loginRes = await callRoute(loginRoute, {
      method: "POST",
      path: "/api/users/login",
      body: { email: creds.email, password: creds.password },
    });

    expect(loginRes.status).toBe(200);
    const tokenCookie = loginRes.cookies.find((cookie) =>
      cookie.startsWith("token=")
    );
    expect(tokenCookie).toBeDefined();
  });

  test("POST /api/users/login rejects invalid password", async () => {
    const { creds } = await signupAndLogin();
    const res = await callRoute(loginRoute, {
      method: "POST",
      path: "/api/users/login",
      body: { email: creds.email, password: "wrong-password" },
    });

    expect(res.status).toBe(400);
    expect(res.body?.message).toMatch(/invalid/i);
    const tokenCookie = res.cookies.find((cookie) =>
      cookie.startsWith("token=")
    );
    expect(tokenCookie).toBeUndefined();
  });

  test("GET /api/users/me returns current user when authenticated", async () => {
    const { loginRes, creds } = await signupAndLogin();
    const res = await callRoute(meRoute, {
      method: "GET",
      path: "/api/users/me",
      cookies: loginRes.cookies,
    });

    expect(res.status).toBe(200);
    expect(res.body?.data?.email).toBe(creds.email);
  });

  test("GET /api/users/me errors without cookie", async () => {
    const res = await callRoute(meRoute, {
      method: "GET",
      path: "/api/users/me",
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body?.message).toBeDefined();
  });
});

describe("Shelf routes", () => {
  test("POST /api/users/shelves adds comics once per shelf", async () => {
    const { loginRes } = await signupAndLogin();
    const cookie = loginRes.cookies;
    const payload = {
      shelf: "favorites",
      comic: {
        volumeId: "vol-1",
        title: "Saga",
      },
    };

    const firstAdd = await callRoute(shelvesPostRoute, {
      method: "POST",
      path: "/api/users/shelves",
      body: payload,
      cookies: cookie,
    });
    expect(firstAdd.status).toBe(200);
    expect(firstAdd.body?.data?.favorites).toHaveLength(1);

    const secondAdd = await callRoute(shelvesPostRoute, {
      method: "POST",
      path: "/api/users/shelves",
      body: payload,
      cookies: cookie,
    });
    expect(secondAdd.status).toBe(200);
    expect(secondAdd.body?.data?.favorites).toHaveLength(1);
  });

  test("DELETE /api/users/shelves removes comic from shelf", async () => {
    const { loginRes } = await signupAndLogin();
    const cookie = loginRes.cookies;
    const payload = {
      shelf: "readLater" as const,
      comic: {
        volumeId: "vol-42",
        title: "Batman",
      },
    };

    await callRoute(shelvesPostRoute, {
      method: "POST",
      path: "/api/users/shelves",
      body: payload,
      cookies: cookie,
    });

    const removeRes = await callRoute(shelvesDeleteRoute, {
      method: "DELETE",
      path: "/api/users/shelves",
      body: { shelf: "readLater", volumeId: "vol-42" },
      cookies: cookie,
    });

    expect(removeRes.status).toBe(200);
    expect(removeRes.body?.data?.readLater).toHaveLength(0);
  });

  test("Shelf routes return 401 when unauthenticated", async () => {
    const res = await callRoute(shelvesPostRoute, {
      method: "POST",
      path: "/api/users/shelves",
      body: { shelf: "favorites", comic: { volumeId: "v1" } },
    });

    expect(res.status).toBe(401);
    expect(res.body?.message).toMatch(/not authenticated/i);
  });
});
