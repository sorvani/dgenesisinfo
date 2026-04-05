import Link from "next/link";
import { getCharacters, getOrbs, getTimelineEvents } from "@/lib/data";

export default function Home() {
  const characters = getCharacters();
  const orbs = getOrbs();
  const timeline = getTimelineEvents();

  return (
    <>
      <section className="hero">
        <h1 className="hero-title">
          <span className="accent">D-Genesis</span> Stats
        </h1>
        <p className="hero-subtitle">
          A fan-curated database tracking explorer rankings, combat stats, and
          skill orbs from <span style={{ display: 'inline-block' }}><em>D-Genesis: Three Years after the Dungeons Appeared</em>.</span>
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{characters.length}</div>
            <div className="hero-stat-label">Characters</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{orbs.length}</div>
            <div className="hero-stat-label">Skill Orbs</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">
              {characters.reduce((sum, c) => sum + c.stats.length, 0)}
            </div>
            <div className="hero-stat-label">Stat Readings</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{timeline.length}</div>
            <div className="hero-stat-label">Timeline Events</div>
          </div>
        </div>
        <div className="card-grid" style={{ marginTop: 'var(--space-3xl)', textAlign: 'left', maxWidth: '1000px', marginInline: 'auto' }}>
          <Link href="/wdarl" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ position: 'absolute', right: '-5px', bottom: '-25px', fontSize: '7rem', opacity: 0.03, fontWeight: 900, fontFamily: 'var(--font-mono)', zIndex: 0 }}>01</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: 'var(--accent-teal)', marginBottom: 'var(--space-xs)' }}>
                WDARL Rankings &rarr;
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Explore the official World Dungeon Association Ranking List and see who stands at the top.
              </p>
            </div>
          </Link>

          <Link href="/characters" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ position: 'absolute', right: '-5px', bottom: '-25px', fontSize: '7rem', opacity: 0.03, fontWeight: 900, fontFamily: 'var(--font-mono)', zIndex: 0 }}>02</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: 'var(--space-xs)' }}>
                Characters &rarr;
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Browse detailed profiles, combat stats, and history of all known explorers and key figures.
              </p>
            </div>
          </Link>

          <Link href="/orbs" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ position: 'absolute', right: '-5px', bottom: '-25px', fontSize: '7rem', opacity: 0.03, fontWeight: 900, fontFamily: 'var(--font-mono)', zIndex: 0 }}>03</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: 'var(--accent-purple)', marginBottom: 'var(--space-xs)' }}>
                Skill Orbs &rarr;
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Discover the various skill orbs dropped from dungeons, their known effects, and drop records.
              </p>
            </div>
          </Link>

          <Link href="/timeline" className="card" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ position: 'absolute', right: '-5px', bottom: '-25px', fontSize: '7rem', opacity: 0.03, fontWeight: 900, fontFamily: 'var(--font-mono)', zIndex: 0 }}>04</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: 'var(--accent-amber)', marginBottom: 'var(--space-xs)' }}>
                Timeline &rarr;
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Trace the chronological events following the appearance of the dungeons worldwide.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
