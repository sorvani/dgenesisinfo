<script lang="ts">
	import type { PageData } from './$types';
	import { getTimelineEventDate, formatCitation } from '$lib/utils';
	import { renderMd } from '$lib/markdown';

	let { data }: { data: PageData } = $props();

	// Group events by section
	const sections = $derived(() => {
		const result: { key: string; label: string; events: typeof data.events }[] = [];
		const map = new Map<string, typeof data.events>();

		for (const ev of data.events) {
			const key = ev.pre_history ? 'pre-history' : `vol-${ev.citation.volume ?? 'unknown'}`;
			const label = ev.pre_history ? 'Pre-History' : `Book ${ev.citation.volume}`;
			if (!map.has(key)) {
				map.set(key, []);
				result.push({ key, label, events: map.get(key)! });
			}
			map.get(key)!.push(ev);
		}
		return result;
	});

	function scrollTo(key: string) {
		if (key === 'top') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<svelte:head><title>Timeline — D-Genesis Info</title></svelte:head>

<div class="container page">

	<div class="timeline-header">
		<div class="timeline-title-row">
			<h1 class="page-title">Timeline</h1>
			<span class="page-count"><em>{data.events.length} events</em></span>
		</div>

		<div class="filter-row">
			<button class="filter-btn" onclick={() => scrollTo('top')}>All</button>
			<button class="filter-btn" onclick={() => scrollTo('pre-history')}>Pre-History</button>
			{#each data.volumes as vol}
				<button class="filter-btn" onclick={() => scrollTo(`vol-${vol}`)}>Book {vol}</button>
			{/each}
		</div>
	</div>

	<div class="timeline">
		{#each sections() as section, si}
			<div id="section-{section.key}" class="section-divider">
				<span class="section-label">{section.label}</span>
			</div>

			{#each section.events as ev, i}
				{@const right = (si + i) % 2 === 0}
				<div class="timeline-row" class:right class:left={!right}>
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
	.timeline-header { margin-bottom: 2rem; }

	.timeline-title-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.875rem;
	}

	.page-count { font-size: 0.875rem; color: var(--text-3); }

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
		transition: border-color 0.15s, color 0.15s;
	}

	.filter-btn:hover { border-color: var(--accent); color: var(--accent); }

	/* Section divider */
	.section-divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 2rem 0 1.25rem;
		scroll-margin-top: 70px; /* offset for sticky nav */
	}

	.section-divider::before, .section-divider::after {
		content: ''; flex: 1; height: 1px; background: var(--border);
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

	/* Timeline rows */
	.timeline-row {
		display: grid;
		grid-template-columns: 1fr 24px 1fr;
		column-gap: 1rem;
		margin-bottom: 1.25rem;
		align-items: start;
	}

	.timeline-spacer { }

	/* Right: spacer | dot | card */
	.right .timeline-spacer   { order: 0; }
	.right .timeline-dot-col  { order: 1; }
	.right .timeline-card-col { order: 2; }

	/* Left: card | dot | spacer */
	.left .timeline-spacer   { order: 2; }
	.left .timeline-dot-col  { order: 1; }
	.left .timeline-card-col { order: 0; }

	.timeline-dot-col {
		display: flex;
		justify-content: center;
		padding-top: 0.75rem;
		position: relative;
	}

	.timeline-dot-col::before {
		content: '';
		position: absolute;
		top: 0; bottom: -1.25rem; left: 50%;
		width: 1px;
		background: var(--border);
		transform: translateX(-50%);
	}

	.timeline-dot {
		width: 10px; height: 10px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bg);
		box-shadow: 0 0 0 1px var(--accent);
		position: relative;
		z-index: 1;
	}

	.timeline-card { padding: 0.875rem 1rem; }

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
	.timeline-card__citation { margin-top: 0.5rem; }

	.md-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}

	@media (max-width: 640px) {
		.timeline-row { grid-template-columns: 20px 1fr; }
		.timeline-spacer { display: none; }
		.left .timeline-dot-col  { order: 0; }
		.left .timeline-card-col { order: 1; }
	}
</style>
