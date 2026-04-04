"use client";

import { useState, useRef, useEffect } from 'react';
import {
  type TimelineEvent,
  getTimelineEventDate,
  getBookLabel,
  formatCitation,
} from '@/lib/data';

interface Props {
  events: TimelineEvent[];
  books: number[];
}

export function Timeline({ events, books }: Props) {
  const [activeBook, setActiveBook] = useState<number | 'all'>('all');
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const filteredEvents = activeBook === 'all'
    ? events
    : events.filter(e => e.book === activeBook);

  // Group events by book for rendering dividers
  const groupedByBook: { book: number; events: TimelineEvent[] }[] = [];
  let currentBook: number | null = null;
  for (const event of filteredEvents) {
    if (event.book !== currentBook) {
      groupedByBook.push({ book: event.book, events: [] });
      currentBook = event.book;
    }
    groupedByBook[groupedByBook.length - 1].events.push(event);
  }

  const handleFilterClick = (book: number | 'all') => {
    setActiveBook(book);
    if (book !== 'all' && sectionRefs.current[book]) {
      // Small delay to let filter apply
      setTimeout(() => {
        sectionRefs.current[book]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Intersection observer for animation
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute('data-event-id'));
            if (!isNaN(id)) {
              setVisibleIds(prev => new Set(prev).add(id));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observerRef.current = observer;

    // Observe all currently rendered timeline rows
    const elements = document.querySelectorAll('.timeline-row');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredEvents]);

  let globalIndex = 0;

  return (
    <div>
      {/* Filter Bar */}
      <div className="timeline-filter-bar" id="timeline-filters">
        <button
          className={`timeline-filter-pill${activeBook === 'all' ? ' active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          All
        </button>
        {books.map(book => (
          <button
            key={book}
            className={`timeline-filter-pill${activeBook === book ? ' active' : ''}`}
            onClick={() => handleFilterClick(book)}
          >
            {getBookLabel(book)}
          </button>
        ))}
      </div>

      {/* Event count */}
      <div className="timeline-event-count">
        {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
      </div>

      {/* Timeline */}
      <div className="timeline-container" id="timeline-container">
        {groupedByBook.map((group, groupIdx) => {
          return (
            <div key={`${group.book}-${groupIdx}`}>
              {/* Book Divider */}
              <div
                className="timeline-book-divider"
                ref={el => { sectionRefs.current[group.book] = el; }}
              >
                <div className="timeline-book-divider-line" />
                <span className="timeline-book-divider-label">
                  {getBookLabel(group.book)}
                </span>
                <div className="timeline-book-divider-line" />
              </div>

              {/* Events */}
              {group.events.map((event) => {
                const side = globalIndex % 2 === 0 ? 'left' : 'right';
                const isVisible = visibleIds.has(event.id);
                globalIndex++;

                const dateStr = getTimelineEventDate(event);
                const citationStr = event.citation ? formatCitation(event.citation) : null;

                return (
                  <div
                    key={event.id}
                    className={`timeline-row timeline-row-${side}${isVisible ? ' visible' : ''}`}
                    data-event-id={event.id}
                  >
                    {/* Dot on center line */}
                    <div className="timeline-dot-wrapper">
                      <div className={`timeline-dot${event.display_time ? ' timeline-dot-timed' : ''}`} />
                    </div>

                    {/* Card */}
                    <div className="timeline-event-card">
                      <div className="timeline-event-date-row">
                        <span className="timeline-date-badge">
                          {dateStr}
                        </span>
                        {event.timezone !== 'JST' && (
                          <span className="timeline-tz-badge">{event.timezone}</span>
                        )}
                      </div>
                      <div 
                        className="timeline-event-text"
                        dangerouslySetInnerHTML={{ __html: event.event }}
                      />
                      {citationStr && (
                        <div className="timeline-event-citation">
                          <span className="citation-badge">📖 {citationStr}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* End of Book marker (except for the last group) */}
              {groupIdx < groupedByBook.length - 1 && (
                <div className="timeline-book-end">
                  <span>End of {getBookLabel(group.book)}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Final end marker */}
        {groupedByBook.length > 0 && (
          <div className="timeline-book-end timeline-book-end-final">
            <span>End of {getBookLabel(groupedByBook[groupedByBook.length - 1].book)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
