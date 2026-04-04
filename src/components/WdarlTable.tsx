"use client";

import Link from "next/link";
import {
  type Explorer,
  getHistoricalRankingAt,
  getFullName,
} from "@/lib/data";

interface Props {
  explorers: Explorer[];
  maxScore: number | null;
  onClose: () => void;
}

export function WdarlTable({ explorers, maxScore, onClose }: Props) {
  // Only show explorers that have a known rank (not "unknown")
  const ranked = explorers
    .map((e) => {
      const ranking = getHistoricalRankingAt(e, maxScore);
      const rankVal =
        ranking && ranking.rank && ranking.rank !== 0
          ? ranking.rank
          : ranking?.known_above_rank
            ? ranking.known_above_rank - 1
            : null;
      return { explorer: e, ranking, rankVal };
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
              World Dungeon Association Ranking List
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
              {ranked.map(({ explorer, ranking }) => {
                const isPublic = explorer.public;
                const rankDisplay =
                  ranking && ranking.rank && ranking.rank !== 0
                    ? ranking.rank.toLocaleString()
                    : "—";

                return (
                  <tr key={explorer.slug}>
                    <td className="wdarl-rank">{rankDisplay}</td>
                    <td>{explorer.area ?? "—"}</td>
                    <td>
                      {isPublic
                        ? explorer.nationality || ""
                        : ""}
                    </td>
                    <td>
                      {isPublic ? (
                        <Link
                          href={`/explorers/${explorer.slug}`}
                          className="wdarl-name-link"
                          onClick={onClose}
                        >
                          {getFullName(explorer)}
                        </Link>
                      ) : (
                        <Link
                          href={`/explorers/${explorer.slug}`}
                          className="wdarl-name-anon"
                          onClick={onClose}
                        >
                          ✱ <span className="wdarl-name-anon-hint">({getFullName(explorer)})</span>
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
