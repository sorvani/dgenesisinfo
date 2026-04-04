import type { Metadata } from "next";
import { getCharacters, getAllUniqueRankingCitations } from "@/lib/data";
import { ExplorersGrid } from "@/components/ExplorersGrid";

export const metadata: Metadata = {
  title: "WDARL Explorer Rankings",
  description:
    "World Dungeon Association Ranking List — all known explorers from D-Genesis sorted by rank.",
};

export default function ExplorersPage() {
  const characters = getCharacters().filter(c => c.in_wdarl);
  const citations = getAllUniqueRankingCitations();

  return (
    <>
      <div className="page-header">
        <h1>WDARL Explorer Rankings</h1>
        <p>
          World Dungeon Association Ranking List — {characters.length} known
          explorers sorted by current rank. Click an explorer to view their full
          stats, orbs, and ranking history.
        </p>
      </div>
      <ExplorersGrid initialCharacters={characters} citations={citations} />
    </>
  );
}
