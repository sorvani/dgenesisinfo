import type { Metadata } from 'next';
import { getOrbs, getCharacters, getTimelineEvents } from '@/lib/data';
import { ContributeForm } from '@/components/ContributeForm';

export const metadata: Metadata = {
  title: 'Contribute Data',
  description: 'Propose edits or additions to the D-Genesis database.',
};

async function fetchIssueCount(label: string, state: 'open' | 'closed') {
  try {
    const q = encodeURIComponent(`repo:sorvani/dgenesisinfo type:issue state:${state} label:contribution label:"${label}"`);
    const res = await fetch(`https://api.github.com/search/issues?q=${q}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total_count || 0;
  } catch (error) {
    return 0;
  }
}

export default async function ContributePage() {
  const orbs = getOrbs();
  const characters = getCharacters();
  const timeline = getTimelineEvents();
  
  const [
    orbOpen, orbClosed,
    charOpen, charClosed,
    timeOpen, timeClosed
  ] = await Promise.all([
    fetchIssueCount('orb data', 'open'), fetchIssueCount('orb data', 'closed'),
    fetchIssueCount('character data', 'open'), fetchIssueCount('character data', 'closed'),
    fetchIssueCount('timeline data', 'open'), fetchIssueCount('timeline data', 'closed')
  ]);

  return (
    <>
      <div className="page-header">
        <h1>Contribute</h1>
        <p>
          Notice a typo, dropping error, or have new stats from the latest volume? Select a record below to generate a proposed edit. 
          Your browser will securely transfer your edited JSON to a pre-filled GitHub Issue for review.
        </p>
      </div>

      <div className="animate-in" style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        {[
          { label: 'character data', display: 'Character Data', open: charOpen, closed: charClosed },
          { label: 'orb data', display: 'Skill Orb', open: orbOpen, closed: orbClosed },
          { label: 'timeline data', display: 'Timeline', open: timeOpen, closed: timeClosed },
        ].map(stat => (
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
              <span style={{ color: 'var(--accent-teal)' }}>{stat.open} Open</span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>{stat.closed} Closed</span>
            </div>
          </a>
        ))}
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
        <ContributeForm orbs={orbs} characters={characters} timeline={timeline} />
      </div>
    </>
  );
}
