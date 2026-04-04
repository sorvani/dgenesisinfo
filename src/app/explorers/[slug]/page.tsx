import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getExplorers,
  getExplorerBySlug,
  getOrbById,
  getFullName,
  getLatestRanking,
  formatRank,
  formatDate,
  formatCitation,
  getNationalityFlag,
} from "@/lib/data";
import { CitationBadge } from "@/components/CitationBadge";

export async function generateStaticParams() {
  const explorers = getExplorers();
  return explorers.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(
  props: PageProps<"/explorers/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const explorer = getExplorerBySlug(slug);
  if (!explorer) return { title: "Explorer Not Found" };
  const name = getFullName(explorer);
  return {
    title: `${name}${explorer.moniker ? ` "${explorer.moniker}"` : ""}`,
    description: `Stats, rankings, and skill orbs for ${name} from D-Genesis.`,
  };
}

export default async function ExplorerDetailPage(
  props: PageProps<"/explorers/[slug]">
) {
  const { slug } = await props.params;
  const explorer = getExplorerBySlug(slug);
  if (!explorer) notFound();

  const name = getFullName(explorer);
  const latestRanking = getLatestRanking(explorer);
  const flag = getNationalityFlag(explorer.nationality);

  // Sort rankings by date (most recent first)
  const sortedRankings = [...explorer.rankings].sort((a, b) => {
    const dateA = a.date_noted ? new Date(a.date_noted).getTime() : 0;
    const dateB = b.date_noted ? new Date(b.date_noted).getTime() : 0;
    return dateB - dateA;
  });

  // Sort stats by date and sequence
  const sortedStats = [...explorer.stats].sort((a, b) => {
    const dateA = a.date_noted ? new Date(a.date_noted).getTime() : 0;
    const dateB = b.date_noted ? new Date(b.date_noted).getTime() : 0;
    if (dateA !== dateB) return dateA - dateB;
    return (a.date_sequence || 0) - (b.date_sequence || 0);
  });

  return (
    <>
      <div className="detail-header">
        <div className="detail-breadcrumb">
          <Link href="/explorers">← WDARL Rankings</Link>
        </div>
        <h1 className="detail-title">
          {name}
          {!explorer.public && <span className="wdarl-anon-badge">✱ Anonymous on WDARL</span>}
        </h1>
        {explorer.moniker && (
          <div className="detail-subtitle">
            &ldquo;{explorer.moniker}&rdquo;
          </div>
        )}
        <div className="detail-meta">
          <div className="detail-meta-item">
            <span className="detail-meta-label">Rank:</span>
            <strong style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
              #{formatRank(latestRanking)}
            </strong>
          </div>
          {explorer.sex && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Sex:</span>
              <span>{explorer.sex}</span>
            </div>
          )}
          {explorer.birthday && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Birthday:</span>
              <span>{explorer.birthday}</span>
            </div>
          )}
          {explorer.nationality && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Nationality:</span>
              <span>
                {flag} {explorer.nationality}
              </span>
            </div>
          )}
          {explorer.date_first_known && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">First Known:</span>
              <span>{formatDate(explorer.date_first_known)}</span>
            </div>
          )}
          {latestRanking?.citation && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Rank Citation:</span>
              <CitationBadge citation={latestRanking.citation} />
            </div>
          )}
        </div>
      </div>

      {explorer.note && (
        <section className="detail-section">
          <h2 className="detail-section-title">Note</h2>
          <div className="card" style={{ padding: 'var(--space-md)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: explorer.note }} />
        </section>
      )}

      {/* ── Orbs Used ─────────────────── */}
      <section className="detail-section">
        <h2 className="detail-section-title">Orbs Used</h2>
        {explorer.orbs_used.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="data-table-wrapper detail-desktop-only">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Orb Name</th>
                    <th>Date Acquired</th>
                    <th>Note</th>
                    <th>Citation</th>
                  </tr>
                </thead>
                <tbody>
                  {explorer.orbs_used.map((orbUsed, i) => {
                    const orbInfo = orbUsed.orb_id
                      ? getOrbById(orbUsed.orb_id)
                      : null;
                    return (
                      <tr key={i}>
                        <td>
                          {orbInfo ? (
                            <Link
                              href={`/orbs/${orbInfo.slug}`}
                              style={{ color: "var(--accent-teal)" }}
                            >
                              {orbInfo.orb_name}
                            </Link>
                          ) : (
                            <span className="value-muted">Unknown Orb</span>
                          )}
                        </td>
                        <td>{formatDate(orbUsed.date_acquired)}</td>
                        <td style={{ whiteSpace: "normal", maxWidth: "300px" }}>
                          {orbUsed.date_note || "—"}
                        </td>
                        <td>
                          <CitationBadge citation={orbUsed.citation} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile stacked cards */}
            <div className="detail-mobile-only">
              {explorer.orbs_used.map((orbUsed, i) => {
                const orbInfo = orbUsed.orb_id
                  ? getOrbById(orbUsed.orb_id)
                  : null;
                return (
                  <div key={i} className="mobile-stacked-card">
                    <div className="mobile-stacked-row mobile-stacked-row-primary">
                      <span className="mobile-stacked-name">
                        {orbInfo ? (
                          <Link
                            href={`/orbs/${orbInfo.slug}`}
                            style={{ color: "var(--accent-teal)" }}
                          >
                            {orbInfo.orb_name}
                          </Link>
                        ) : (
                          <span className="value-muted">Unknown Orb</span>
                        )}
                      </span>
                      <span className="mobile-stacked-date">
                        {formatDate(orbUsed.date_acquired)}
                      </span>
                    </div>
                    {orbUsed.date_note && (
                      <div className="mobile-stacked-row mobile-stacked-row-note">
                        {orbUsed.date_note}
                      </div>
                    )}
                    {orbUsed.citation && (
                      <div className="mobile-stacked-row mobile-stacked-row-citation">
                        <CitationBadge citation={orbUsed.citation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>
            No orbs known to have been used.
          </p>
        )}
      </section>

      {/* ── Rankings Over Time ─────────── */}
      <section className="detail-section">
        <h2 className="detail-section-title">Rankings Over Time</h2>
        {sortedRankings.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="data-table-wrapper detail-desktop-only">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Known Above</th>
                    <th>Date Noted</th>
                    <th>Citation</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRankings.map((ranking, i) => (
                    <tr key={i}>
                      <td className="value-highlight">
                        {ranking.rank && ranking.rank !== 0
                          ? ranking.rank.toLocaleString()
                          : "—"}
                      </td>
                      <td>
                        {ranking.known_above_rank
                          ? `Above ${ranking.known_above_rank.toLocaleString()}`
                          : "—"}
                      </td>
                      <td>{formatDate(ranking.date_noted)}</td>
                      <td>
                        <CitationBadge citation={ranking.citation} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile stacked cards */}
            <div className="detail-mobile-only">
              {sortedRankings.map((ranking, i) => (
                <div key={i} className="mobile-stacked-card">
                  <div className="mobile-stacked-row mobile-stacked-row-primary">
                    <span>
                      <span className="value-highlight" style={{ marginRight: "var(--space-sm)" }}>
                        {ranking.rank && ranking.rank !== 0
                          ? `#${ranking.rank.toLocaleString()}`
                          : "—"}
                      </span>
                      {ranking.known_above_rank && (
                        <span className="value-muted" style={{ fontSize: "0.8rem" }}>
                          Above {ranking.known_above_rank.toLocaleString()}
                        </span>
                      )}
                    </span>
                    <span className="mobile-stacked-date">
                      {formatDate(ranking.date_noted)}
                    </span>
                  </div>
                  {ranking.citation && (
                    <div className="mobile-stacked-row mobile-stacked-row-citation">
                      <CitationBadge citation={ranking.citation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>
            No ranking history available.
          </p>
        )}
      </section>

      {/* ── Explorer Stats ─────────────── */}
      <section className="detail-section">
        <h2 className="detail-section-title">Explorer Stats</h2>
        {sortedStats.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="data-table-wrapper detail-desktop-only">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Seq</th>
                    <th>Scan</th>
                    <th>SP</th>
                    <th>HP</th>
                    <th>MP</th>
                    <th>STR</th>
                    <th>VIT</th>
                    <th>INT</th>
                    <th>AGI</th>
                    <th>DEX</th>
                    <th>LUC</th>
                    <th>Total</th>
                    <th>Dev</th>
                    <th>Citation</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((stat, i) => (
                    <tr key={i}>
                      <td>{formatDate(stat.date_noted)}</td>
                      <td className="value-muted">{stat.date_sequence ?? "—"}</td>
                      <td>{stat.scan_type || "—"}</td>
                      <td className="value-highlight">
                        {stat.sp !== null ? stat.sp : "—"}
                      </td>
                      <td>{stat.hp !== null ? stat.hp : "—"}</td>
                      <td>{stat.mp !== null ? stat.mp : "—"}</td>
                      <td>{stat.str ?? "—"}</td>
                      <td>{stat.vit ?? "—"}</td>
                      <td>{stat.int ?? "—"}</td>
                      <td>{stat.agi ?? "—"}</td>
                      <td>{stat.dex ?? "—"}</td>
                      <td>{stat.luc ?? "—"}</td>
                      <td className="value-highlight">
                        {stat.stat_total ?? "—"}
                      </td>
                      <td>{stat.points_from_average ?? "—"}</td>
                      <td>
                        <CitationBadge citation={stat.citation} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile stat cards */}
            <div className="detail-mobile-only">
              {sortedStats.map((stat, i) => (
                <div key={i} className="mobile-stat-card">
                  <div className="mobile-stat-header">
                    <div className="mobile-stat-header-row">
                      <span>
                        {formatDate(stat.date_noted)}
                        {stat.date_sequence != null && (
                          <span className="value-muted"> · #{stat.date_sequence}</span>
                        )}
                      </span>
                    </div>
                    <div className="mobile-stat-header-row">
                      <span className="value-muted">
                        {stat.scan_type || "—"}
                      </span>
                      <span className="value-highlight">
                        SP {stat.sp !== null ? stat.sp : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mobile-stat-grid">
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">HP</span>
                      <span className="mobile-stat-value">{stat.hp !== null ? stat.hp : "—"}</span>
                    </div>
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">MP</span>
                      <span className="mobile-stat-value">{stat.mp !== null ? stat.mp : "—"}</span>
                    </div>
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">STR</span>
                      <span className="mobile-stat-value">{stat.str ?? "—"}</span>
                    </div>
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">VIT</span>
                      <span className="mobile-stat-value">{stat.vit ?? "—"}</span>
                    </div>
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">INT</span>
                      <span className="mobile-stat-value">{stat.int ?? "—"}</span>
                    </div>
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">AGI</span>
                      <span className="mobile-stat-value">{stat.agi ?? "—"}</span>
                    </div>
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">DEX</span>
                      <span className="mobile-stat-value">{stat.dex ?? "—"}</span>
                    </div>
                    <div className="mobile-stat-cell">
                      <span className="mobile-stat-label">LUC</span>
                      <span className="mobile-stat-value">{stat.luc ?? "—"}</span>
                    </div>
                  </div>
                  <div className="mobile-stat-totals">
                    <span>
                      <span className="mobile-stat-label">Total</span>
                      <span className="value-highlight">{stat.stat_total ?? "—"}</span>
                    </span>
                    <span>
                      <span className="mobile-stat-label">Dev</span>
                      <span>{stat.points_from_average ?? "—"}</span>
                    </span>
                  </div>
                  {stat.citation && (
                    <div className="mobile-stacked-row mobile-stacked-row-citation">
                      <CitationBadge citation={stat.citation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No stats available.</p>
        )}
      </section>

      {/* ── Radar Chart Placeholder ────── */}
      {sortedStats.length > 0 && (
        <section className="detail-section">
          <h2 className="detail-section-title">Stat Visualization</h2>
          <div className="radar-placeholder">
            <div className="radar-placeholder-icon">📊</div>
            <p>Radar / Spider chart coming soon</p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Will visualize STR, VIT, INT, AGI, DEX, LUC over time
            </p>
          </div>
        </section>
      )}
    </>
  );
}
