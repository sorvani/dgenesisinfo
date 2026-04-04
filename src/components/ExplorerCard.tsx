import Link from "next/link";
import {
  type Character,
  getHistoricalRankingAt,
  formatRank,
  getFullName,
  formatDate,
  getNationalityFlag,
} from "@/lib/data";

export function CharacterCard({ character, historicalMaxScore = null, routePrefix = '/characters' }: { character: Character, historicalMaxScore?: number | null, routePrefix?: string }) {
  const latestRanking = getHistoricalRankingAt(character, historicalMaxScore);
  const rank = latestRanking ? formatRank(latestRanking) : 'Unranked At Time';
  const name = getFullName(character);
  const flag = getNationalityFlag(character.nationality);

  return (
    <Link href={`${routePrefix}/${character.slug}`} id={`character-${character.slug}`} style={{ display: 'block', height: '100%' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="character-card-name" style={{ fontSize: '1.5rem' }}>
          {name}
          {!character.public && <span className="wdarl-anon-badge">✱ Anonymous</span>}
        </div>
        <div className="character-card-rank" style={{ fontSize: '1.125rem', color: rank === 'Unranked At Time' ? 'var(--text-muted)' : 'inherit' }}>
          {rank === 'Unranked At Time' || rank === 'Unknown' ? rank : `#${rank}`}
        </div>
        {character.moniker && (
          <div className="character-card-moniker">&ldquo;{character.moniker}&rdquo;</div>
        )}
        <div className="character-card-meta" style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
          {character.sex && (
            <span>👤 {character.sex}</span>
          )}
          {character.birthday && (
            <span>🎂 {character.birthday}</span>
          )}
          {character.nationality && (
            <span>
              {flag} {character.nationality}
            </span>
          )}
          {character.date_first_known && (
            <span>📅 {formatDate(character.date_first_known)}</span>
          )}
          {character.orbs_used.length > 0 && (
            <span>🔮 {character.orbs_used.length} orbs</span>
          )}
          {character.stats.length > 0 && (
            <span>📊 {character.stats.length} readings</span>
          )}
        </div>
      </div>
    </Link>
  );
}
