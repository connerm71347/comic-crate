/**
 * Browse page server-component tests: ensures ComicVine proxy calls are made,
 * results render, empty states show, and card links point to comic detail pages.
 */

import { render, screen } from "@testing-library/react";
import BrowsePage from "@/app/browse/page";
import { cvFetch, cvUrl } from "@/db/comicvine";

jest.mock("@/db/comicvine", () => ({
  cvUrl: jest.fn(() => "mock-url"),
  cvFetch: jest.fn(),
}));

describe("BrowsePage server component", () => {
  beforeEach(() => {
    (cvFetch as jest.Mock).mockReset();
    (cvUrl as jest.Mock).mockClear();
  });

  async function renderBrowse(search: { q?: string } = { q: "saga" }) {
    const ui = await BrowsePage({
      searchParams: Promise.resolve(search),
    });
    render(ui);
  }

  test("fetches and displays search results", async () => {
    (cvFetch as jest.Mock).mockResolvedValue({
      status_code: 1,
      results: [
        {
          id: 123,
          name: "Saga",
          deck: "Space opera",
          start_year: "2012",
          publisher: { name: "Image" },
          image: { super_url: "/cover.jpg" },
        },
      ],
    });

    await renderBrowse({ q: "saga" });

    expect(cvUrl).toHaveBeenCalledWith(
      "search/",
      expect.objectContaining({ query: "saga" })
    );
    expect(await screen.findByText("Saga")).toBeInTheDocument();
  });

  test("shows no results message", async () => {
    (cvFetch as jest.Mock).mockResolvedValue({
      status_code: 1,
      results: [],
    });

    await renderBrowse({ q: "unknown" });

    expect(
      await screen.findByText(/no results found/i)
    ).toBeInTheDocument();
  });

  test("comic cards link to detail page", async () => {
    (cvFetch as jest.Mock).mockResolvedValue({
      status_code: 1,
      results: [
        {
          id: 321,
          name: "Batman",
          deck: "Dark knight",
          start_year: "1987",
          publisher: { name: "DC" },
          image: { super_url: "/bat.jpg" },
        },
      ],
    });

    await renderBrowse({ q: "batman" });

    const link = await screen.findByRole("link", { name: /batman/i });
    expect(link).toHaveAttribute("href", "/comics/321");
  });
});
