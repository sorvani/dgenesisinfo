import Link from "next/link";
import {
  Character,
  getOrbById,
  getFullName,
  getLatestRanking,
  formatRank,
  formatDate,
  getNationalityFlag,
} from "@/lib/data";
import { CitationBadge } from "@/components/CitationBadge";

interface CharacterDetailProps {
  character: Character;
  backHref: string;
  backLabel: string;
}

export function CharacterDetail({ character, backHref, backLabel }: CharacterDetailProps) {
  const name = getFullName(character);
  const latestRanking = getLatestRanking(character);
  const flag = getNationalityFlag(character.nationality);

  // Sort rankings by date (most recent first)
  const sortedRankings = [...character.rankings].sort((a, b) => {
    const dateA = a.date_noted ? new Date(a.date_noted).getTime() : 0;
    const dateB = b.date_noted ? new Date(b.date_noted).getTime() : 0;
    return dateB - dateA;
  });

  // Sort stats by date and sequence
  const sortedStats = [...character.stats].sort((a, b) => {
    const dateA = a.date_noted ? new Date(a.date_noted).getTime() : 0;
    const dateB = b.date_noted ? new Date(b.date_noted).getTime() : 0;
    if (dateA !== dateB) return dateA - dateB;
    return (a.date_sequence || 0) - (b.date_sequence || 0);
  });

  return (
    <>
      <div className="detail-header">
        <div className="detail-breadcrumb">
          <Link href={backHref}>← {backLabel}</Link>
        </div>
        <h1 className="detail-title">
          {name}
          {!character.public && character.in_wdarl && <span className="wdarl-anon-badge">✱ Anonymous on WDARL</span>}
        </h1>
        {character.moniker && (
          <div className="detail-subtitle">
            &ldquo;{character.moniker}&rdquo;
          </div>
        )}
        <div className="detail-meta">
          {character.in_wdarl && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Rank:</span>
              <strong style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
                #{formatRank(latestRanking)}
              </strong>
            </div>
          )}
          {character.sex && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Sex:</span>
              <span>{character.sex}</span>
            </div>
          )}
          {character.birthday && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Birthday:</span>
              <span>{character.birthday}</span>
            </div>
          )}
          {character.nationality && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Nationality:</span>
              <span>
                {flag} {character.nationality}
              </span>
            </div>
          )}
          {character.date_first_known && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">First Known:</span>
              <span>{formatDate(character.date_first_known)}</span>
            </div>
          )}
          {character.in_wdarl && latestRanking?.citation && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Rank Citation:</span>
              <CitationBadge citation={latestRanking.citation} />
            </div>
          )}
        </div>
        {character.citation && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <CitationBadge citation={character.citation} />
          </div>
        )}
      </div>

      {character.note && (
        <section className="detail-section">
          <h2 className="detail-section-title">Note</h2>
          <div className="card" style={{ padding: 'var(--space-md)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: character.note }} />
        </section>
      )}

      {/* ── Orbs Used ─────────────────── */}
      {character.orbs_used && character.orbs_used.length > 0 && (
        <section className="detail-section">
          <h2 className="detail-section-title">Orbs Used</h2>
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
                  {character.orbs_used.map((orbUsed, i) => {
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
              {character.orbs_used.map((orbUsed, i) => {
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
        </section>
      )}

      {/* ── Rankings Over Time ─────────── */}
      {character.rankings && sortedRankings.length > 0 && (
        <section className="detail-section">
          <h2 className="detail-section-title">Rankings Over Time</h2>
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
        </section>
      )}

      {/* ── Explorer Stats ─────────────── */}
      {character.stats && sortedStats.length > 0 && (
        <section className="detail-section">
          <h2 className="detail-section-title">Combat Stats</h2>
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
        </section>
      )}
    </>
  );
}
