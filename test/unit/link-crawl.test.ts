import { describe, expect, it, vi } from "vitest";

import { crawlLinkUrl, normalizeLinkUrl } from "../../app/service/links/link-crawl";

const successPayload = {
  ok: true,
  mode: "static",
  fallback: false,
  durationMs: 120,
  data: {
    title: "Example",
    description: "Desc",
    url: "https://example.com",
    site_name: "Example",
    image: "https://example.com/og.png",
    favicon: "https://example.com/favicon.ico",
  },
} as const;

describe("normalizeLinkUrl", () => {
  it("adds https when protocol is missing", () => {
    expect(normalizeLinkUrl("example.com")).toBe("https://example.com");
  });

  it("keeps the provided protocol", () => {
    expect(normalizeLinkUrl("https://example.com")).toBe(
      "https://example.com"
    );
    expect(normalizeLinkUrl("http://example.com")).toBe("http://example.com");
  });

  it("rejects empty input", () => {
    expect(() => normalizeLinkUrl("   ")).toThrow("URL is required.");
  });
});

describe("crawlLinkUrl", () => {
  it("retries with backoff and returns the crawl payload", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => successPayload,
      });

    const delays: number[] = [];
    const sleep = (delayMs: number) => {
      delays.push(delayMs);
      return Promise.resolve();
    };

    const result = await crawlLinkUrl("example.com", {
      baseUrl: "https://crawler.test",
      fetcher,
      sleep,
      random: () => 0.5,
    });

    expect(result.normalizedUrl).toBe("https://example.com");
    expect(result.response).toEqual(successPayload);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenCalledWith(
      "https://crawler.test/api/crawl?url=https%3A%2F%2Fexample.com&mode=auto",
      expect.objectContaining({ method: "GET" })
    );
    expect(delays).toEqual([500, 1500]);
  });

  it("throws after the final attempt fails", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    const sleep = vi.fn(() => Promise.resolve());

    await expect(
      crawlLinkUrl("example.com", {
        baseUrl: "https://crawler.test",
        fetcher,
        sleep,
        random: () => 0.5,
      })
    ).rejects.toThrow("Crawler request failed with 503.");

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });
});
