<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, formatDate } from '$lib/utils';
	import { Mars, Venus } from 'lucide-svelte';
	import Flag from '$lib/Flag.svelte';
	import FilterBar from '$lib/FilterBar.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let query      = $state(page.url.searchParams.get('q') ?? '');
	let activeTags = $state<string[]>(page.url.searchParams.getAll('tag'));

	const filtered = $derived(data.characters.filter(c => {
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

	function addTag(t: string, e: MouseEvent | KeyboardEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!activeTags.includes(t)) activeTags = [...activeTags, t];
	}
</script>

<svelte:head><title>Characters — D-Genesis Info</title></svelte:head>

<div class="container page">
	<div class="page-header">
		<h1 class="page-title">Characters</h1>
		<div class="page-header-right">
			<span class="page-count"><em>{data.characters.length} named characters</em></span>
			{#if data.user}
				<a href="/contribute?type=character&op=insert" class="action-add">+ Add Character</a>
			{/if}
		</div>
	</div>

	<FilterBar
		bind:query
		bind:tags={activeTags}
		placeholder="Filter by name, tag, or moniker…"
		resultCount={filtered.length}
		totalCount={data.characters.length}
	/>

	{#if data.characters.length === 0}
		<p class="empty">No non-explorer characters recorded yet.</p>
	{:else}
		<div class="card-grid">
			{#each filtered as c}
				<a href="/characters/{c.slug}" class="char-card">
					<div class="char-card__identity">
						<div class="char-card__name">
							{#if c.sex === 'Male'}<Mars size={14} strokeWidth={2.25} aria-label="Male" />
							{:else if c.sex === 'Female'}<Venus size={14} strokeWidth={2.25} aria-label="Female" />{/if}
							<Flag code={c.nationality} /> {getFullName(c)}
						</div>
						{#if c.monikers?.length}
							<div class="char-card__moniker">{c.monikers.map(m => `"${m}"`).join(' · ')}</div>
						{/if}
					</div>

					{#if c.date_first_known || c.birthday}
						<div class="char-card__meta">
							{#if c.date_first_known}<div>Introduced: {formatDate(c.date_first_known)}</div>{/if}
							{#if c.birthday}<div>Birthday: {c.birthday}</div>{/if}
						</div>
					{/if}

					{#if c.note}
						<p class="char-card__note">{c.note.replace(/[#*`_~]/g, '').substring(0, 80)}…</p>
					{/if}

					{#if c.tags?.length}
						<div class="char-card__tags">
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
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.75rem;
	}

	.page-count {
		font-size: 0.875rem;
		color: var(--text-3);
	}

	.char-card {
		background: var(--bg-card);
		border: 2px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-card);
		transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, background 0.15s;
	}

	.char-card:hover {
		border-color: var(--accent);
		background: var(--accent-bg);
		box-shadow: var(--shadow-hover);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.char-card__identity { }

	.char-card__name {
		font-weight: 700;
		font-size: 0.9375rem;
		line-height: 1.3;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		flex-wrap: wrap;
	}

	.char-card__moniker {
		font-size: 0.8125rem;
		color: var(--text-3);
		font-style: italic;
		margin-top: 0.125rem;
	}

	.char-card__note {
		font-size: 0.8125rem;
		color: var(--text-3);
		line-height: 1.5;
	}

	.char-card__meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.8rem;
		color: var(--text-2);
		border-top: 1px solid var(--border-soft);
		padding-top: 0.5rem;
	}

	.char-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: auto;
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
</style>
