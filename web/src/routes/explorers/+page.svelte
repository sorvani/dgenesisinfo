<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, formatRank, getHistoricalRankingAt, formatDate } from '$lib/utils';
	import Flag from '$lib/Flag.svelte';
	import FilterBar from '$lib/FilterBar.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let query      = $state(page.url.searchParams.get('q') ?? '');
	let activeTags = $state<string[]>(page.url.searchParams.getAll('tag'));

	const filtered = $derived(data.explorers.filter(c => {
		if (activeTags.length && !activeTags.every(t => c.tags?.includes(t))) return false;
		const q = query.trim().toLowerCase();
		if (!q) return true;
		if (getFullName(c).toLowerCase().includes(q)) return true;
		if (c.monikers?.some(m => m.toLowerCase().includes(q))) return true;
		if (c.tags?.some(t => t.toLowerCase().includes(q)))     return true;
		return false;
	}));

	$effect(() => {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.delete('q');
		url.searchParams.delete('tag');
		if (query.trim()) url.searchParams.set('q', query.trim());
		for (const t of activeTags) url.searchParams.append('tag', t);
		replaceState(url, {});
	});

	function addTag(t: string, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!activeTags.includes(t)) activeTags = [...activeTags, t];
	}
</script>

<svelte:head><title>Explorers — D-Genesis Info</title></svelte:head>

<div class="container page">
	<div class="page-header">
		<h1 class="page-title">Explorers</h1>
		<div class="page-header-right">
			<span class="page-count"><em>{data.explorers.length} known explorers</em></span>
			{#if data.user}
				<a href="/contribute?type=character&op=insert" class="action-add">+ Add Explorer</a>
			{/if}
		</div>
	</div>

	<FilterBar
		bind:query
		bind:tags={activeTags}
		placeholder="Filter by name, tag, or moniker…"
		resultCount={filtered.length}
		totalCount={data.explorers.length}
	/>

	<div class="card-grid">
		{#each filtered as c}
			{@const ranking = getHistoricalRankingAt(c.rankings)}
			<a href="/characters/{c.slug}" class="explorer-card">

				<div class="explorer-card__identity">
					<div class="explorer-card__name">{getFullName(c)}</div>
					{#if c.monikers?.length}
						<div class="explorer-card__moniker">{c.monikers.map(m => `"${m}"`).join(' · ')}</div>
					{/if}
				</div>

				<div class="explorer-card__top">
					<span class="explorer-card__rank">{ranking ? formatRank(ranking) : 'Unranked'}</span>
					<span class="explorer-card__nat"><Flag code={c.nationality} /> {c.nationality ?? ''}</span>
				</div>

				<div class="explorer-card__meta">
					{#if c.sex}<span>{c.sex}</span>{/if}
					{#if c.birthday}<span>{c.birthday}</span>{/if}
					{#if c.date_first_known}<span>First known {formatDate(c.date_first_known)}</span>{/if}
				</div>

				<div class="explorer-card__footer">
					{#if c.tags?.length}
						<div class="explorer-card__tags">
							{#each c.tags as tag}
								<span
									class="tag tag--clickable"
									role="button"
									tabindex="0"
									onclick={(e) => addTag(tag, e)}
									onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') addTag(tag, e); }}
								>{tag}</span>
							{/each}
						</div>
					{/if}
					<div class="explorer-card__counts">
						{#if c.orbs_used?.length}<span>{c.orbs_used.length} orb{c.orbs_used.length !== 1 ? 's' : ''}</span>{/if}
						{#if c.rankings?.length}<span>{c.rankings.length} rank {c.rankings.length !== 1 ? 'entries' : 'entry'}</span>{/if}
					</div>
				</div>

			</a>
		{/each}
	</div>
</div>

<style>
	.page-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.75rem;
	}

	.page-count { font-size: 0.875rem; color: var(--text-3); }

	/* ── Card ── */
	.explorer-card {
		background: var(--bg-card);
		border: 2px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-card);
		transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, background 0.15s;
	}

	.explorer-card:hover {
		border-color: var(--accent);
		background: var(--accent-bg);
		box-shadow: var(--shadow-hover);
		transform: translateY(-2px);
		text-decoration: none;
	}

	/* Rank + nationality row */
	.explorer-card__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--border-soft);
		padding-top: 0.5rem;
	}

	.explorer-card__rank {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--accent);
	}

	.explorer-card__nat {
		font-size: 0.8125rem;
		color: var(--text-3);
	}

	/* Name + moniker */
	.explorer-card__identity { }

	.explorer-card__name {
		font-weight: 700;
		font-size: 1rem;
		color: var(--text);
		line-height: 1.3;
	}

	.explorer-card__moniker {
		font-size: 0.8125rem;
		color: var(--text-3);
		font-style: italic;
		margin-top: 0.125rem;
	}

	/* Metadata row */
	.explorer-card__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		font-size: 0.8rem;
		color: var(--text-2);
	}

	/* Footer: tags + counts */
	.explorer-card__footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		border-top: 1px solid var(--border-soft);
		padding-top: 0.5rem;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.explorer-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.tag {
		font-size: 0.6875rem;
		padding: 0.15em 0.5em;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-3);
	}

	.tag--clickable {
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
	}

	.tag--clickable:hover {
		background: var(--accent-bg);
		border-color: var(--accent);
		color: var(--accent);
	}

	.explorer-card__counts {
		display: flex;
		gap: 0.625rem;
		font-size: 0.75rem;
		color: var(--text-3);
		margin-left: auto;
		white-space: nowrap;
	}
</style>
