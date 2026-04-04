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
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>Event Timeline</h1>
        <p>
          A chronological record of events from <em>D-Genesis</em>, from the first dungeon
          appearance through Book 7. All times are displayed in JST unless noted otherwise.
        </p>
        <div className="page-header-meta">
          {events.length} events across {books.length} book{books.length !== 1 ? 's' : ''}
        </div>
      </div>
      <Timeline events={events} books={books} />
    </>
  );
}
