"use client";

import { useState } from "react";
import Link from "next/link";
import { type Character, getFullName, formatDate, getNationalityFlag } from "@/lib/data";

interface Props {
  characters: Character[];
}

export function CharactersGrid({ characters }: Props) {
  const [showWdarl, setShowWdarl] = useState(true);

  const filteredCharacters = showWdarl ? characters : characters.filter(c => !c.in_wdarl);

  // Sort alphabetically by first name strictly
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    const nameA = getFullName(a).toLowerCase();
    const nameB = getFullName(b).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <div className="animate-in" style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setShowWdarl(!showWdarl)}
          className={showWdarl ? "btn btn-secondary" : "btn btn-primary"}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {showWdarl ? "👁️ Hide WDARL Explorers" : "📋 Show All Entities"}
        </button>
      </div>

      <div className="card-grid">
      {sortedCharacters.map((character, i) => {
        const name = getFullName(character);
        const flag = getNationalityFlag(character.nationality);
        
        return (
          <div
            key={character.slug}
            className="animate-in"
            style={{ animationDelay: `${Math.min(i * 10, 200)}ms`, height: "100%" }}
          >
            <Link
              href={character.in_wdarl ? `/wdarl/${character.slug}` : `/characters/${character.slug}`}
              id={`character-${character.slug}`}
              style={{ display: "block", height: "100%" }}
            >
              <div className="card" style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                background: "linear-gradient(to bottom right, var(--bg-secondary), var(--bg-primary))",
                borderTop: "3px solid var(--accent-teal)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div className="character-card-name" style={{ fontSize: "1.5rem", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{name}</span>
                </div>
                
                {/* Tags Row */}
                {character.tags && character.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    {character.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {character.moniker && (
                  <div className="character-card-moniker" style={{ marginTop: 'var(--space-sm)', fontStyle: 'italic', fontWeight: 600, color: 'var(--accent-teal)' }}>
                    &ldquo;{character.moniker}&rdquo;
                  </div>
                )}
                
                {character.note && (
                  <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                    {character.note.replace(/<[^>]*>?/gm, '')}
                  </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: "var(--space-md)", display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {character.sex && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👤 {character.sex}</span>}
                  {character.birthday && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🎂 {character.birthday}</span>}
                  {character.nationality && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {flag} {character.nationality}
                    </span>
                  )}
                  {character.date_first_known && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📅 {formatDate(character.date_first_known)}</span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
    </>
  );
}
