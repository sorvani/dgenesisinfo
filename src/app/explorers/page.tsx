import type { Metadata } from "next";
import { getExplorers } from "@/lib/data";
import { ExplorerCard } from "@/components/ExplorerCard";

export const metadata: Metadata = {
  title: "WDARL Explorer Rankings",
  description:
    "World Dungeon Authority Ranking List — all known explorers from D-Genesis sorted by rank.",
};

export default function ExplorersPage() {
  const explorers = getExplorers();

  return (
    <>
      <div className="page-header">
        <h1>WDARL Explorer Rankings</h1>
        <p>
          World Dungeon Authority Ranking List — {explorers.length} known
          explorers sorted by current rank. Click an explorer to view their full
          stats, orbs, and ranking history.
        </p>
      </div>
      <div className="card-grid">
        {explorers.map((explorer, i) => (
          <div
            key={explorer.slug}
            className="animate-in"
            style={{ animationDelay: `${Math.min(i * 50, 500)}ms`, height: '100%' }}
          >
            <ExplorerCard explorer={explorer} />
          </div>
        ))}
      </div>
    </>
  );
}
