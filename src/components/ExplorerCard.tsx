import Link from "next/link";
import {
  type Explorer,
  getLatestRanking,
  formatRank,
  getFullName,
  formatDate,
  getNationalityFlag,
} from "@/lib/data";

export function ExplorerCard({ explorer }: { explorer: Explorer }) {
  const latestRanking = getLatestRanking(explorer);
  const rank = formatRank(latestRanking);
  const name = getFullName(explorer);
  const flag = getNationalityFlag(explorer.nationality);

  return (
    <Link href={`/explorers/${explorer.slug}`} id={`explorer-${explorer.slug}`}>
      <div className="card">
        <div className="explorer-card-rank">#{rank}</div>
        <div className="explorer-card-name">{name}</div>
        {explorer.moniker && (
          <div className="explorer-card-moniker">&ldquo;{explorer.moniker}&rdquo;</div>
        )}
        <div className="explorer-card-meta">
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
