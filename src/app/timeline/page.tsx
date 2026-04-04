import type { Metadata } from 'next';
import { getTimelineEvents, getTimelineBooks } from '@/lib/data';
import { Timeline } from '@/components/Timeline';

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'A chronological timeline of events from D-Genesis: Three Years after the Dungeons Appeared, spanning Books 1 through 7.',
};

export default function TimelinePage() {
  const events = getTimelineEvents();
  const books = getTimelineBooks();

  return (
    <>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h1>Event Timeline</h1>
        <p style={{ maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          A chronological record of events from <em>D-Genesis</em>, from the first dungeon
          appearance through Book {books.filter(b => b > 0).length}. All times are displayed in JST unless noted otherwise.
        </p>
        <div className="page-header-meta">
          {events.length} events across {books.filter(b => b > 0).length} book{books.filter(b => b > 0).length !== 1 ? 's' : ''}
        </div>
      </div>
      <Timeline events={events} books={books} />
    </>
  );
}
