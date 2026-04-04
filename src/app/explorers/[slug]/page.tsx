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
        <h1 className="detail-title">{name}</h1>
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

      {/* ── Orbs Used ─────────────────── */}
      <section className="detail-section">
        <h2 className="detail-section-title">Orbs Used</h2>
        {explorer.orbs_used.length > 0 ? (
          <div className="data-table-wrapper">
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
          <div className="data-table-wrapper">
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
          <div className="data-table-wrapper">
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
