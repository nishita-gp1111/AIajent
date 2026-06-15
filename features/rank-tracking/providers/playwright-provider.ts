import { chromium, type Browser } from "playwright";
import { detectRankFromScreenshot } from "../gemini-vision";
import { findBestStoreMatch } from "../matching";
import type { RankLookupInput, RankTrackingProvider } from "../types";

const DEFAULT_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function extractResultNames(page: import("playwright").Page, maxResults: number) {
  const feed = page.locator('[role="feed"]');
  if (await feed.count()) {
    let previousCount = 0;
    for (let i = 0; i < 8; i += 1) {
      const links = feed.locator('a[href*="/maps/place/"]');
      const count = await links.count();
      if (count >= maxResults || (count === previousCount && i >= 2)) break;
      previousCount = count;
      await feed.evaluate((element) => element.scrollBy(0, element.scrollHeight));
      await page.waitForTimeout(650);
    }
  }

  const names = await page.locator('a[href*="/maps/place/"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute("aria-label") || link.textContent || "")
  );
  return Array.from(new Set(names.map((name) => name.trim()).filter(Boolean))).slice(0, maxResults);
}

export class PlaywrightRankProvider implements RankTrackingProvider {
  readonly name = "playwright" as const;
  private browser?: Browser;

  private async getBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: process.env.RANK_BROWSER_HEADLESS !== "false",
        executablePath: process.env.RANK_BROWSER_EXECUTABLE_PATH || DEFAULT_CHROME_PATH
      });
    }
    return this.browser;
  }

  async close() {
    await this.browser?.close();
    this.browser = undefined;
  }

  async lookup({ store, keyword, maxResults = 20 }: RankLookupInput) {
    let page: import("playwright").Page | undefined;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage({
        locale: "ja-JP",
        viewport: { width: 1440, height: 1100 }
      });
      const area = store.address.replace(/[0-9０-９].*$/, "").trim();
      const query = [keyword, area].filter(Boolean).join(" ");
      await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ja`, {
        waitUntil: "domcontentloaded",
        timeout: 45_000
      });
      await page.waitForTimeout(1800);

      const bodyText = await page.locator("body").innerText().catch(() => "");
      if (/unusual traffic|captcha|ロボットではありません/i.test(bodyText)) {
        throw new Error("Google Maps側で追加確認が必要なため取得を停止しました。");
      }

      const names = await extractResultNames(page, maxResults);
      const best = findBestStoreMatch(store.name, names);
      if (best.index >= 0 && best.score >= 0.82) {
        return {
          keyword,
          position: best.index + 1,
          matchedStoreName: best.candidate,
          status: "succeeded" as const,
          source: "dom" as const,
          confidence: best.score,
          resultCount: names.length
        };
      }

      const shouldUseVision = names.length === 0 || best.score >= 0.45;
      const vision = shouldUseVision
        ? await page
            .screenshot({ type: "png", fullPage: false })
            .then((screenshot) =>
              detectRankFromScreenshot({
                image: screenshot,
                storeName: store.name,
                address: store.address,
                keyword,
                visibleResultCount: names.length
              })
            )
            .catch(() => null)
        : null;
      if (vision?.position && vision.position <= maxResults && vision.confidence >= 0.55) {
        return {
          keyword,
          position: vision.position,
          matchedStoreName: vision.matchedStoreName || undefined,
          status: "succeeded" as const,
          source: "gemini_vision" as const,
          confidence: vision.confidence,
          resultCount: names.length
        };
      }

      return {
        keyword,
        status: "not_found" as const,
        source: vision ? ("gemini_vision" as const) : ("none" as const),
        confidence: vision?.confidence || 0,
        resultCount: names.length
      };
    } catch (error) {
      return {
        keyword,
        status: "failed" as const,
        source: "none" as const,
        confidence: 0,
        resultCount: 0,
        error: error instanceof Error ? error.message : "順位取得に失敗しました。"
      };
    } finally {
      await page?.close();
    }
  }
}
