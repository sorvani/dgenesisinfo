<script lang="ts">
	import type { PageData } from './$types';
	import FilterBar from '$lib/FilterBar.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let query = $state(page.url.searchParams.get('q') ?? '');

	const filtered = $derived(data.monsters.filter(m => {
		const q = query.trim().toLowerCase();
		if (!q) return true;
		if (m.name.toLowerCase().includes(q)) return true;
		if (m.category?.toLowerCase().includes(q)) return true;
		if (m.dungeons.some(d => d.name.toLowerCase().includes(q))) return true;
		return false;
	}));

	$effect(() => {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.delete('q');
		if (query.trim()) url.searchParams.set('q', query.trim());
		replaceState(url, {});
	});
</script>

<svelte:head><title>Bestiary — D-Genesis Info</title></svelte:head>

<div class="container page">
	<div class="page-header">
		<h1 class="page-title">Bestiary</h1>
		<div class="page-header-right">
			<span class="page-count"><em>{data.monsters.length} creatures</em></span>
			{#if data.user}
				<a href="/contribute?type=monster&op=insert" class="action-add">+ Add Creature</a>
			{/if}
		</div>
	</div>

	<FilterBar
		bind:query
		placeholder="Filter creatures by name, category, or dungeon…"
		resultCount={filtered.length}
		totalCount={data.monsters.length}
	/>

	<div class="card-grid">
		{#each filtered as m}
			<a href="/bestiary/{m.slug}" class="monster-card">
				<div class="monster-card__name">{m.name}</div>
				<div class="monster-card__top">
					<span class="monster-card__category">{m.category ?? 'Unknown'}</span>
					{#if m.drop_count > 0}
						<span class="monster-card__drops">{m.drop_count} orb{m.drop_count !== 1 ? 's' : ''}</span>
					{/if}
				</div>
				{#if m.dungeons.length}
					<div class="monster-card__dungeons">
						{#each m.dungeons as d}
							<span class="dungeon-chip">{d.name}</span>
						{/each}
					</div>
				{/if}
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

	.monster-card {
		background: var(--bg-card);
		border: 2px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-card);
		transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, background 0.15s;
	}

	.monster-card:hover {
		border-color: var(--accent);
		background: var(--accent-bg);
		box-shadow: var(--shadow-hover);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.monster-card__name {
		font-weight: 700;
		font-size: 0.9375rem;
		color: var(--text);
	}

	.monster-card__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--border-soft);
		padding-top: 0.5rem;
	}

	.monster-card__category {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-3);
	}

	.monster-card__drops {
		font-size: 0.75rem;
		color: var(--accent);
		font-family: var(--font-mono);
	}

	.monster-card__dungeons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-top: auto;
	}

	.dungeon-chip {
		font-size: 0.6875rem;
		padding: 0.15em 0.5em;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-3);
	}
</style>
