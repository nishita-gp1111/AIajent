import type { RankProvider } from "@/features/core/types";
import type { RankTrackingProvider } from "../types";
import { PlaywrightRankProvider } from "./playwright-provider";

export function createRankTrackingProvider(
  name = (process.env.RANK_TRACKING_PROVIDER || "playwright") as RankProvider
): RankTrackingProvider {
  if (name === "playwright") return new PlaywrightRankProvider();
  throw new Error(`${name} プロバイダーはまだ実装されていません。`);
}
