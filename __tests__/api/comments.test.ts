/**
 * @jest-environment node
 *
 * Comment API flows backed by in-memory mocks for users/comments so we can
 * exercise GET/POST/like/delete handlers without a real Mongo instance.
 */

import { callRoute } from "@/test-utils/routeTestUtils";
import { resetMockDb } from "@/test-utils/mockDbState";

type CommentsRoute = typeof import("@/app/api/comics/[id]/comments/route");
type LikeRoute = typeof import("@/app/api/comments/[id]/like/route").POST;
type CommentDeleteRoute = typeof import("@/app/api/comments/[id]/route").DELETE;
type SignupRoute = typeof import("@/app/api/users/signup/route").POST;
type LoginRoute = typeof import("@/app/api/users/login/route").POST;

let commentsRoute: CommentsRoute;
let likeRoute: LikeRoute;
let deleteRoute: CommentDeleteRoute;
let signupRoute: SignupRoute;
let loginRoute: LoginRoute;

let userCounter = 0;
function makeCreds() {
  userCounter += 1;
  return {
    username: `commenter${userCounter}`,
    email: `commenter${userCounter}@test.com`,
    password: "P@ssw0rd!",
  };
}

async function signupAndLogin() {
  const creds = makeCreds();
  await callRoute(signupRoute, {
    method: "POST",
    path: "/api/users/signup",
    body: creds,
  });

  const loginRes = await callRoute(loginRoute, {
    method: "POST",
    path: "/api/users/login",
    body: { email: creds.email, password: creds.password },
  });

  return { creds, cookies: loginRes.cookies };
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

jest.mock("@/db/dbConfig", () => ({ connectToDB: jest.fn() }));
jest.mock("@/models/userModel", () => require("@/test-utils/mockUserModel").default);
jest.mock("@/models/commentModel", () => require("@/test-utils/mockCommentModel").default);

beforeAll(async () => {
  process.env.TOKEN_SECRET = "test-secret";
  commentsRoute = await import("@/app/api/comics/[id]/comments/route");
  ({ POST: likeRoute } = await import("@/app/api/comments/[id]/like/route"));
  ({ DELETE: deleteRoute } = await import("@/app/api/comments/[id]/route"));
  ({ POST: signupRoute } = await import("@/app/api/users/signup/route"));
  ({ POST: loginRoute } = await import("@/app/api/users/login/route"));
});

afterEach(async () => {
  resetMockDb();
  userCounter = 0;
});

describe("Comic comments API", () => {
  const comicId = "vol-9001";

  test("GET /api/comics/:id/comments returns list", async () => {
    const { cookies } = await signupAndLogin();
    await callRoute(commentsRoute.POST, {
      method: "POST",
      path: `/api/comics/${comicId}/comments`,
      body: { text: "First!" },
      cookies,
      context: params(comicId),
    });

    const res = await callRoute(commentsRoute.GET, {
      method: "GET",
      path: `/api/comics/${comicId}/comments`,
      context: params(comicId),
    });

    expect(res.status).toBe(200);
    expect(res.body?.data).toHaveLength(1);
    expect(res.body?.data[0]?.text).toBe("First!");
  });

  test("POST /api/comics/:id/comments creates a comment when authenticated", async () => {
    const { cookies } = await signupAndLogin();
    const res = await callRoute(commentsRoute.POST, {
      method: "POST",
      path: `/api/comics/${comicId}/comments`,
      body: { text: "Great issue" },
      cookies,
      context: params(comicId),
    });

    expect(res.status).toBe(201);
    expect(res.body?.data?.text).toBe("Great issue");

    const unauth = await callRoute(commentsRoute.POST, {
      method: "POST",
      path: `/api/comics/${comicId}/comments`,
      body: { text: "Nope" },
      context: params(comicId),
    });
    expect(unauth.status).toBe(401);
  });

  test("Like route toggles likes for the current user", async () => {
    const { cookies } = await signupAndLogin();
    const created = await callRoute(commentsRoute.POST, {
      method: "POST",
      path: `/api/comics/${comicId}/comments`,
      body: { text: "Toggle me" },
      cookies,
      context: params(comicId),
    });

    const commentId = created.body?.data?._id;
    const like = await callRoute(likeRoute, {
      method: "POST",
      path: `/api/comments/${commentId}/like`,
      cookies,
      context: params(commentId),
    });

    expect(like.status).toBe(200);
    expect(like.body?.data?.likes).toHaveLength(1);

    const unlike = await callRoute(likeRoute, {
      method: "POST",
      path: `/api/comments/${commentId}/like`,
      cookies,
      context: params(commentId),
    });

    expect(unlike.status).toBe(200);
    expect(unlike.body?.data?.likes).toHaveLength(0);
  });

  test("DELETE /api/comments/:id enforces ownership", async () => {
    const owner = await signupAndLogin();
    const otherUser = await signupAndLogin();

    const created = await callRoute(commentsRoute.POST, {
      method: "POST",
      path: `/api/comics/${comicId}/comments`,
      body: { text: "Mine" },
      cookies: owner.cookies,
      context: params(comicId),
    });
    const commentId = created.body?.data?._id;

    const forbidden = await callRoute(deleteRoute, {
      method: "DELETE",
      path: `/api/comments/${commentId}`,
      cookies: otherUser.cookies,
      context: params(commentId),
    });
    expect(forbidden.status).toBe(403);

    const success = await callRoute(deleteRoute, {
      method: "DELETE",
      path: `/api/comments/${commentId}`,
      cookies: owner.cookies,
      context: params(commentId),
    });
    expect(success.status).toBe(200);
    expect(success.body?.success).toBe(true);
  });
});
