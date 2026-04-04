import type { Metadata } from "next";
import { getExplorers, getAllUniqueRankingCitations } from "@/lib/data";
import { ExplorersGrid } from "@/components/ExplorersGrid";

export const metadata: Metadata = {
  title: "WDARL Explorer Rankings",
  description:
    "World Dungeon Association Ranking List — all known explorers from D-Genesis sorted by rank.",
};

export default function ExplorersPage() {
  const explorers = getExplorers();
  const citations = getAllUniqueRankingCitations();

  return (
    <>
      <div className="page-header">
        <h1>WDARL Explorer Rankings</h1>
        <p>
          World Dungeon Association Ranking List — {explorers.length} known
          explorers sorted by current rank. Click an explorer to view their full
          stats, orbs, and ranking history.
        </p>
      </div>
      <ExplorersGrid initialExplorers={explorers} citations={citations} />
    </>
  );
}
