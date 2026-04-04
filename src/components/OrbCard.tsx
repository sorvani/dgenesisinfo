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
    <Link href={`/orbs/${orb.slug}`} id={`orb-${orb.slug}`} style={{ display: 'block', height: '100%' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="orb-card-name">{orb.orb_name || "Unknown"}</div>
        <div className="orb-card-effects">{truncated}</div>
        {orb.drop_rates.length > 0 && (
          <div className="orb-card-drops" style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
            {orb.drop_rates.length} known drop source
            {orb.drop_rates.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
