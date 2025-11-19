/**
 * Comic detail page integration tests: render mock comic data, exercise
 * auth gating, shelf toggles, comment creation, and like toggling with
 * axios/toast mocks and a fake AuthContext.
 */

"use client";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComicDetailPage from "@/app/comics/[id]/page";
import axios from "axios";
import toast from "react-hot-toast";
import { createAuthWrapper } from "@/test-utils/mockAuthContext";
import { useParams } from "next/navigation";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/components/AuthModal", () => (props: any) =>
  props.open ? <div data-testid="auth-modal" /> : null
);
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
(useParams as jest.Mock).mockReturnValue({ id: "1" });

describe("ComicDetailPage interactions", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.delete.mockReset();
    (toast.error as jest.Mock).mockReset();
    (toast.success as jest.Mock).mockReset();
  });

  function mockGetResponses({
    userData,
    comments = [],
  }: {
    userData?: any;
    comments?: any[];
  } = {}) {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/users/me") {
        return Promise.resolve({ data: { data: userData ?? null } });
      }
      if (url.startsWith("/api/comics/") && url.endsWith("/comments")) {
        return Promise.resolve({ data: { data: comments } });
      }
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
  }

  test("renders comic info from mock data and prompts login", async () => {
    mockGetResponses({ comments: [] });
    const Wrapper = createAuthWrapper({ user: null });
    render(<ComicDetailPage />, { wrapper: Wrapper });

    expect(
      await screen.findByRole("heading", { name: /spider-man/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/log in to leave a comment/i)
    ).toBeInTheDocument();
  });

  test("logged out click on shelf shows auth modal", async () => {
    mockGetResponses({ comments: [] });
    const Wrapper = createAuthWrapper({ user: null });
    const user = userEvent.setup();

    render(<ComicDetailPage />, { wrapper: Wrapper });

    const favButton = await screen.findByRole("button", {
      name: /add to favorites/i,
    });
    await user.click(favButton);

    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });

  test("logged in user can add/remove favorites", async () => {
    mockGetResponses({
      userData: {
        favorites: [],
        readLater: [],
        alreadyRead: [],
      },
      comments: [],
    });
    mockedAxios.post.mockResolvedValue({ data: { data: {} } });
    const refreshUser = jest.fn().mockResolvedValue(undefined);
    const Wrapper = createAuthWrapper({
      user: { _id: "u1", username: "Carol" } as any,
      refreshUser,
    });
    const user = userEvent.setup();

    render(<ComicDetailPage />, { wrapper: Wrapper });

    const favButton = await screen.findByRole("button", {
      name: /add to favorites/i,
    });
    await user.click(favButton);

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/users/shelves", {
      shelf: "favorites",
      comic: expect.objectContaining({ volumeId: "1" }),
    });
    await waitFor(() =>
      expect(favButton).toHaveTextContent(/remove from favorites/i)
    );
  });

  test("comment form posts and renders new comment", async () => {
    mockGetResponses({
      userData: { favorites: [], readLater: [], alreadyRead: [] },
      comments: [],
    });
    const createdComment = {
      _id: "c1",
      text: "Great issue",
      likes: [],
      username: "Carol",
    };
    mockedAxios.post.mockResolvedValue({
      data: { data: createdComment },
    });
    const Wrapper = createAuthWrapper({
      user: { _id: "u1", username: "Carol" } as any,
    });
    const user = userEvent.setup();

    render(<ComicDetailPage />, { wrapper: Wrapper });

    const textarea = await screen.findByPlaceholderText(
      /share your thoughts/i
    );
    await user.type(textarea, "Great issue");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/comics/1/comments", {
      text: "Great issue",
    });
    expect(await screen.findByText("Great issue")).toBeInTheDocument();
  });

  test("like button triggers API call", async () => {
    mockGetResponses({
      userData: { favorites: [], readLater: [], alreadyRead: [] },
      comments: [{ _id: "c2", text: "Nice", likes: [], username: "Bob" }],
    });
    mockedAxios.post.mockResolvedValue({
      data: {
        data: { _id: "c2", text: "Nice", likes: ["u1"], username: "Bob" },
      },
    });
    const Wrapper = createAuthWrapper({
      user: { _id: "u1", username: "Carol" } as any,
    });
    const user = userEvent.setup();

    render(<ComicDetailPage />, { wrapper: Wrapper });

    const likeBtn = await screen.findByRole("button", { name: /🤍/i });
    await user.click(likeBtn);

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/comments/c2/like");
  });
});
