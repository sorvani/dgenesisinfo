import type { Metadata } from "next";
import { getOrbs } from "@/lib/data";
import { OrbCard } from "@/components/OrbCard";

export const metadata: Metadata = {
  title: "Skill Orbs",
  description:
    "All known skill orbs from D-Genesis — effects, drop rates, and source creatures.",
};

export default function OrbsPage() {
  const orbs = getOrbs();

  return (
    <>
      <div className="page-header">
        <h1>Skill Orbs</h1>
        <p>
          {orbs.length} known skill orbs catalogued from D-Genesis. Click an orb
          to view drop rates, effects, and source creatures.
        </p>
      </div>
      <div className="card-grid">
        {orbs.map((orb, i) => (
          <div
            key={orb.id}
            className="animate-in"
            style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
          >
            <OrbCard orb={orb} />
          </div>
        ))}
      </div>
    </>
  );
}
