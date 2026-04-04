import type { Metadata } from 'next';
import { getOrbs, getCharacters, getTimelineEvents } from '@/lib/data';
import { ContributeForm } from '@/components/ContributeForm';

export const metadata: Metadata = {
  title: 'Contribute Data',
  description: 'Propose edits or additions to the D-Genesis database.',
};

export default function ContributePage() {
  const orbs = getOrbs();
  const characters = getCharacters();
  const timeline = getTimelineEvents();
  
  return (
    <>
      <div className="page-header">
        <h1>Contribute</h1>
        <p>
          Notice a typo, dropping error, or have new stats from the latest volume? Select a record below to generate a proposed edit. 
          Your browser will securely transfer your edited JSON to a pre-filled GitHub Issue for review.
        </p>
      </div>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
        <ContributeForm orbs={orbs} characters={characters} timeline={timeline} />
      </div>
    </>
  );
}
