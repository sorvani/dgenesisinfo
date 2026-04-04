import Link from "next/link";
import { type Orb } from "@/lib/data";

export function OrbCard({ orb }: { orb: Orb }) {
  // Strip HTML tags for display in card
  const effectsText = orb.known_effects
    ? orb.known_effects.replace(/<[^>]*>/g, " ").trim()
    : "Not documented";

  const truncated =
    effectsText.length > 120 ? effectsText.slice(0, 120) + "…" : effectsText;

  return (
    <Link href={`/orbs/${orb.slug}`} id={`orb-${orb.slug}`}>
      <div className="card">
        <div className="orb-card-name">{orb.orb_name || "Unknown"}</div>
        <div className="orb-card-effects">{truncated}</div>
        {orb.drop_rates.length > 0 && (
          <div className="orb-card-drops">
            {orb.drop_rates.length} known drop source
            {orb.drop_rates.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
