"use client";

import { useState, useEffect } from 'react';

interface StatItem {
  label: string;
  display: string;
}

const STAT_ITEMS: StatItem[] = [
  { label: 'character data', display: 'Character Data' },
  { label: 'orb data', display: 'Skill Orb' },
  { label: 'timeline data', display: 'Timeline' },
];

async function fetchIssueCount(label: string, state: 'open' | 'closed'): Promise<number> {
  try {
    const q = encodeURIComponent(`repo:sorvani/dgenesisinfo type:issue state:${state} label:contribution label:"${label}"`);
    const res = await fetch(`https://api.github.com/search/issues?q=${q}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total_count || 0;
  } catch {
    return 0;
  }
}

export function ContributionStats() {
  const [counts, setCounts] = useState<Record<string, { open: number; closed: number }>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const promises = STAT_ITEMS.flatMap(item => [
        fetchIssueCount(item.label, 'open').then(n => ({ key: item.label, state: 'open' as const, count: n })),
        fetchIssueCount(item.label, 'closed').then(n => ({ key: item.label, state: 'closed' as const, count: n })),
      ]);

      const results = await Promise.all(promises);
      const map: Record<string, { open: number; closed: number }> = {};
      for (const r of results) {
        if (!map[r.key]) map[r.key] = { open: 0, closed: 0 };
        map[r.key][r.state] = r.count;
      }
      setCounts(map);
      setLoaded(true);
    };
    load();
  }, []);

  return (
    <div className="animate-in" style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
      {STAT_ITEMS.map(stat => {
        const c = counts[stat.label];
        return (
          <a
            key={stat.label}
            href={`https://github.com/sorvani/dgenesisinfo/issues?q=is:issue+label:contribution+label:"${encodeURIComponent(stat.label)}"`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'var(--bg-secondary)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '200px',
              transition: 'transform 0.2s, background-color 0.2s',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: 'var(--space-xs)' }}>{stat.display} Contributions</span>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', fontSize: '0.85rem' }}>
              {loaded ? (
                <>
                  <span style={{ color: 'var(--accent-teal)' }}>{c?.open ?? 0} Open</span>
                  <span style={{ color: 'var(--text-muted)' }}>|</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c?.closed ?? 0} Closed</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Loading…</span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
