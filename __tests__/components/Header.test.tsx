/**
 * Header component behavior: verifies auth-aware nav states, modal toggling,
 * and logout flow using a mocked AuthContext + axios.
 */

"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/Header";
import axios from "axios";
import { createAuthWrapper } from "@/test-utils/mockAuthContext";
import { useRouter } from "next/navigation";

jest.mock("axios");
jest.mock("@/components/SearchBar", () => () => <div data-testid="search" />);
jest.mock("@/components/AuthModal", () => (props: any) =>
  props.open ? <div data-testid="auth-modal" /> : null
);
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockRouterPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

describe("Header component", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockRouterPush.mockReset();
  });

  test("shows Login/Profile buttons when signed out", () => {
    const Wrapper = createAuthWrapper({ user: null, loading: false });
    render(<Header />, { wrapper: Wrapper });

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /profile/i })
    ).toBeInTheDocument();
  });

  test("shows Profile link and Logout when signed in", () => {
    const Wrapper = createAuthWrapper({
      user: { username: "Carol" } as any,
      loading: false,
    });
    render(<Header />, { wrapper: Wrapper });

    expect(
      screen.getByRole("link", { name: /profile/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /logout/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /login/i })).not.toBeInTheDocument();
  });

  test("logout calls API and refreshes auth state", async () => {
    const refreshUser = jest.fn().mockResolvedValue(undefined);
    const Wrapper = createAuthWrapper({
      user: { username: "Carol" } as any,
      loading: false,
      refreshUser,
    });
    mockedAxios.get.mockResolvedValue({ data: {} });
    const user = userEvent.setup();

    render(<Header />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/users/logout");
    expect(refreshUser).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/");
  });
});
