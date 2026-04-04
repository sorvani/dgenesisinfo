"use client";

import { useState } from 'react';
import { type Character, type Citation, getHistoricalRankValueAt, formatCitation, getCitationScore } from '@/lib/data';
import { CharacterCard } from './ExplorerCard';
import { WdarlTable } from './WdarlTable';

interface Props {
  initialCharacters: Character[];
  citations: Citation[];
  routePrefix?: string;
}

export function ExplorersGrid({ initialCharacters, citations, routePrefix = '/wdarl' }: Props) {
  const [maxScoreStr, setMaxScoreStr] = useState<string>('current');
  const [showWdarl, setShowWdarl] = useState(false);

  const maxScore = maxScoreStr === 'current' ? null : Number(maxScoreStr);

  const characters = [...initialCharacters].sort((a, b) => {
    return getHistoricalRankValueAt(a, maxScore) - getHistoricalRankValueAt(b, maxScore);
  });

  return (
    <>
      <div className="animate-in" style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-md)' }}>
        <label style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: 'var(--accent-teal)' }}>View Rankings As Of:</label>
        <select 
          value={maxScoreStr} 
          onChange={(e) => setMaxScoreStr(e.target.value)}
          style={{ flex: '1 1 200px', padding: 'var(--space-sm)', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 'bold' }}
        >
          <option value="current">-- Current (Latest Known Ranks) --</option>
          {citations.map((c, i) => {
             const score = getCitationScore(c);
             return <option key={i} value={score}>{formatCitation(c)}</option>;
          })}
        </select>
        <button
          onClick={() => setShowWdarl(true)}
          className="btn btn-secondary wdarl-toggle-btn"
        >
          📋 WDARL View
        </button>
      </div>

      <div className="card-grid">
        {characters.map((character, i) => (
          <div
            key={character.slug}
            className="animate-in"
            style={{ animationDelay: `${Math.min(i * 10, 200)}ms`, height: '100%' }}
          >
            <CharacterCard character={character} historicalMaxScore={maxScore} routePrefix={routePrefix} />
          </div>
        ))}
      </div>

      {showWdarl && (() => {
        const selectedCitation = maxScore !== null
          ? citations.find(c => getCitationScore(c) === maxScore)
          : null;
        const asOfLabel = selectedCitation ? formatCitation(selectedCitation) : 'Current (Latest Known)';
        return (
          <WdarlTable
            characters={characters}
            maxScore={maxScore}
            asOfLabel={asOfLabel}
            onClose={() => setShowWdarl(false)}
            routePrefix={routePrefix}
          />
        );
      })()}
    </>
  );
}
