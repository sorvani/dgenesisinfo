import Link from "next/link";
import {
  type Explorer,
  getHistoricalRankingAt,
  formatRank,
  getFullName,
  formatDate,
  getNationalityFlag,
} from "@/lib/data";

export function ExplorerCard({ explorer, historicalMaxScore = null }: { explorer: Explorer, historicalMaxScore?: number | null }) {
  const latestRanking = getHistoricalRankingAt(explorer, historicalMaxScore);
  const rank = latestRanking ? formatRank(latestRanking) : 'Unranked At Time';
  const name = getFullName(explorer);
  const flag = getNationalityFlag(explorer.nationality);

  return (
    <Link href={`/explorers/${explorer.slug}`} id={`explorer-${explorer.slug}`} style={{ display: 'block', height: '100%' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="explorer-card-name" style={{ fontSize: '1.5rem' }}>{name}</div>
        <div className="explorer-card-rank" style={{ fontSize: '1.125rem', color: rank === 'Unranked At Time' ? 'var(--text-muted)' : 'inherit' }}>
          {rank === 'Unranked At Time' || rank === 'Unknown' ? rank : `#${rank}`}
        </div>
        {explorer.moniker && (
          <div className="explorer-card-moniker">&ldquo;{explorer.moniker}&rdquo;</div>
        )}
        <div className="explorer-card-meta" style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
          {explorer.sex && (
            <span>👤 {explorer.sex}</span>
          )}
          {explorer.birthday && (
            <span>🎂 {explorer.birthday}</span>
          )}
          {explorer.nationality && (
            <span>
              {flag} {explorer.nationality}
            </span>
          )}
          {explorer.date_first_known && (
            <span>📅 {formatDate(explorer.date_first_known)}</span>
          )}
          {explorer.orbs_used.length > 0 && (
            <span>🔮 {explorer.orbs_used.length} orbs</span>
          )}
          {explorer.stats.length > 0 && (
            <span>📊 {explorer.stats.length} readings</span>
          )}
        </div>
      </div>
    </Link>
  );
}
