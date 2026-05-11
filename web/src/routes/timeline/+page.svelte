<script lang="ts">
	import type { PageData } from './$types';
	import { getTimelineEventDate, formatCitation } from '$lib/utils';
	import { renderMd } from '$lib/markdown';

	let { data }: { data: PageData } = $props();

	let activeFilter = $state<string>('all');

	const filtered = $derived(
		activeFilter === 'all'
			? data.events
			: activeFilter === 'pre-history'
				? data.events.filter(e => e.pre_history)
				: data.events.filter(e => !e.pre_history && e.cite_volume === activeFilter)
	);

	// Group events by section
	const grouped = $derived(() => {
		const sections: { label: string; key: string; events: typeof data.events }[] = [];
		const seen = new Set<string>();

		for (const ev of filtered) {
			const key = ev.pre_history ? 'pre-history' : (ev.cite_volume ?? 'unknown');
			const label = ev.pre_history ? 'Pre-History' : `Book ${ev.cite_volume}`;
			if (!seen.has(key)) {
				seen.add(key);
				sections.push({ label, key, events: [] });
			}
			sections.find(s => s.key === key)!.events.push(ev);
		}
		return sections;
	});
</script>

<svelte:head><title>Timeline — D-Genesis Info</title></svelte:head>

<div class="container page">

	<!-- Compact header + filter -->
	<div class="timeline-header">
		<div class="timeline-title-row">
			<h1 class="page-title">Timeline</h1>
			<span class="page-count"><em>{filtered.length} events</em></span>
		</div>

		<div class="filter-row">
			<button class="filter-btn" class:active={activeFilter === 'all'} onclick={() => activeFilter = 'all'}>
				All
			</button>
			{#each data.sections as section}
				<button
					class="filter-btn"
					class:active={activeFilter === section}
					onclick={() => activeFilter = section}
				>
					{section === 'pre-history' ? 'Pre-History' : `Book ${section}`}
				</button>
			{/each}
		</div>
	</div>

	<!-- Timeline -->
	<div class="timeline">
		{#each grouped() as section, si}
			<!-- Section divider -->
			<div class="section-divider">
				<span class="section-label">{section.label}</span>
			</div>

			{#each section.events as ev, i}
				{@const side = (si + i) % 2 === 0 ? 'right' : 'left'}
				<div class="timeline-row" data-side={side}>
					<div class="timeline-spacer"></div>
					<div class="timeline-dot-col">
						<div class="timeline-dot"></div>
					</div>
					<div class="timeline-card-col">
						<div class="timeline-card card">
							<div class="timeline-card__date">{getTimelineEventDate(ev)}</div>
							<div class="timeline-card__event md-content">
								{@html renderMd(ev.event)}
							</div>
							{#if ev.citation.volume}
								<div class="timeline-card__citation">
									<span class="badge badge--citation">{formatCitation(ev.citation)}</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		{/each}
	</div>

</div>

<style>
	/* ── Header ── */
	.timeline-header { margin-bottom: 2rem; }

	.timeline-title-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.875rem;
	}

	.page-count { font-size: 0.875rem; color: var(--text-3); }

	/* ── Filter pills ── */
	.filter-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.filter-btn {
		padding: 0.3rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--bg-card);
		color: var(--text-2);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s, color 0.15s;
	}

	.filter-btn:hover { border-color: var(--accent); color: var(--accent); }

	.filter-btn.active {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	/* ── Timeline structure ── */
	.timeline { position: relative; }

	/* Section divider */
	.section-divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 2rem 0 1.25rem;
	}

	.section-divider::before,
	.section-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	.section-label {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-3);
		padding: 0.25em 0.75em;
		border: 1px solid var(--border);
		border-radius: 999px;
		white-space: nowrap;
	}

	/* Timeline rows — 3-column grid: spacer | dot | card */
	.timeline-row {
		display: grid;
		grid-template-columns: 1fr 24px 1fr;
		gap: 0 1rem;
		margin-bottom: 1.25rem;
		align-items: start;
	}

	/* Right side: spacer | dot | card */
	.timeline-row[data-side="right"] .timeline-spacer { order: 0; }
	.timeline-row[data-side="right"] .timeline-dot-col { order: 1; }
	.timeline-row[data-side="right"] .timeline-card-col { order: 2; }

	/* Left side: card | dot | spacer */
	.timeline-row[data-side="left"] .timeline-spacer { order: 2; }
	.timeline-row[data-side="left"] .timeline-dot-col { order: 1; }
	.timeline-row[data-side="left"] .timeline-card-col { order: 0; text-align: right; }

	.timeline-dot-col {
		display: flex;
		justify-content: center;
		padding-top: 0.75rem;
		position: relative;
	}

	/* Vertical connecting line */
	.timeline-dot-col::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: -1.25rem;
		left: 50%;
		width: 1px;
		background: var(--border);
		transform: translateX(-50%);
		z-index: 0;
	}

	.timeline-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bg);
		box-shadow: 0 0 0 1px var(--accent);
		position: relative;
		z-index: 1;
	}

	/* Cards */
	.timeline-card {
		padding: 0.875rem 1rem;
		text-align: left;
	}

	.timeline-card__date {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 0.4rem;
		font-family: var(--font-mono);
	}

	.timeline-card__event :global(p) {
		font-size: 0.9rem;
		color: var(--text-2);
		line-height: 1.6;
		margin: 0;
	}

	.timeline-card__event :global(p + p) { margin-top: 0.3rem; }

	.timeline-card__citation {
		margin-top: 0.5rem;
	}

	/* Markdown */
	.md-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}

	/* Mobile: single column */
	@media (max-width: 640px) {
		.timeline-row {
			grid-template-columns: 20px 1fr;
		}

		.timeline-spacer { display: none; }
		.timeline-row[data-side="left"] .timeline-dot-col { order: 0; }
		.timeline-row[data-side="left"] .timeline-card-col { order: 1; text-align: left; }
	}
</style>
