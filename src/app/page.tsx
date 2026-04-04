import Link from "next/link";
import { getExplorers, getOrbs } from "@/lib/data";

export default function Home() {
  const explorers = getExplorers();
  const orbs = getOrbs();

  return (
    <>
      <section className="hero">
        <h1 className="hero-title">
          <span className="accent">D-Genesis</span> Stats
        </h1>
        <p className="hero-subtitle">
          A fan-curated database tracking explorer rankings, combat stats, and
          skill orbs from <em>D-Genesis: Three Years after the Dungeons Appeared</em>.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{explorers.length}</div>
            <div className="hero-stat-label">Explorers</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{orbs.length}</div>
            <div className="hero-stat-label">Skill Orbs</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">
              {explorers.reduce((sum, e) => sum + e.stats.length, 0)}
            </div>
            <div className="hero-stat-label">Stat Readings</div>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/explorers" className="btn btn-primary" id="cta-explorers">
            View WDARL Rankings
          </Link>
          <Link href="/orbs" className="btn btn-secondary" id="cta-orbs">
            Browse Skill Orbs
          </Link>
        </div>
      </section>
    </>
  );
}
