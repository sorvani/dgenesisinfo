"use client";

import Link from "next/link";
import {
  type Character,
  getHistoricalRankingAt,
  getFullName,
} from "@/lib/data";

interface Props {
  characters: Character[];
  maxScore: number | null;
  asOfLabel: string;
  onClose: () => void;
  routePrefix?: string;
}

export function WdarlTable({ characters, maxScore, asOfLabel, onClose, routePrefix = '/characters' }: Props) {
  // Only show characters that have a known rank (not "unknown")
  const ranked = characters
    .map((e) => {
      const ranking = getHistoricalRankingAt(e, maxScore);
      const rankVal =
        ranking && ranking.rank && ranking.rank !== 0
          ? ranking.rank
          : ranking?.known_above_rank
            ? ranking.known_above_rank - 1
            : null;
      return { character: e, ranking, rankVal };
    })
    .filter((r) => r.rankVal !== null)
    .sort((a, b) => (a.rankVal ?? Infinity) - (b.rankVal ?? Infinity));

  return (
    <div className="wdarl-overlay" onClick={onClose}>
      <div className="wdarl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wdarl-modal-header">
          <div>
            <div className="wdarl-modal-title">WDARL</div>
            <div className="wdarl-modal-subtitle">
              World Dungeon Association Ranking List — As of: {asOfLabel}
            </div>
          </div>
          <button className="wdarl-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="wdarl-table-scroll">
          <table className="wdarl-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Area</th>
                <th>CC</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(({ character, ranking }) => {
                const isPublic = character.public;
                const rankDisplay =
                  ranking && ranking.rank && ranking.rank !== 0
                    ? ranking.rank.toLocaleString()
                    : "—";

                return (
                  <tr key={character.slug}>
                    <td className="wdarl-rank">{rankDisplay}</td>
                    <td>{character.area ?? "—"}</td>
                    <td>
                      {isPublic
                        ? character.nationality || ""
                        : ""}
                    </td>
                    <td>
                      {isPublic ? (
                        <Link
                          href={`${routePrefix}/${character.slug}`}
                          className="wdarl-name-link"
                          onClick={onClose}
                        >
                          {getFullName(character)}
                        </Link>
                      ) : (
                        <Link
                          href={`${routePrefix}/${character.slug}`}
                          className="wdarl-name-anon"
                          onClick={onClose}
                        >
                          ✱ <span className="wdarl-name-anon-hint">({getFullName(character)})</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
