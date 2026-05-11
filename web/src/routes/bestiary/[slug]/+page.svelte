<script lang="ts">
	import type { PageData } from './$types';
	import { formatCitation, formatProbability, formatCooldown } from '$lib/utils';
	import { renderMd } from '$lib/markdown';
	let { data }: { data: PageData } = $props();
	const m = $derived(data.monster);
</script>

<svelte:head><title>{m.name} — D-Genesis Info</title></svelte:head>

<div class="container page">
	<a href="/bestiary" class="back-link">← Bestiary</a>

	<div class="monster-header__name-row">
		<h1 class="page-title">{m.name}</h1>
		{#if m.category}
			<span class="category-badge">{m.category}</span>
		{/if}
		{#if data.user}
			<a href="/contribute?type=monster&op=update&id={m.id}" class="action-edit">✏ Edit</a>
		{/if}
	</div>

	{#if m.citation.volume}
		<p class="first-cite">
			First cited: <span class="badge badge--citation">{formatCitation(m.citation)}</span>
		</p>
	{/if}

	{#if m.note}
		<div class="data-section">
			<p class="section-heading">Notes</p>
			<div class="md-content note-content">
				{@html renderMd(m.note)}
			</div>
		</div>
	{/if}

	{#if data.drops.length}
		<div class="data-section">
			<p class="section-heading">Orb Drops</p>
			<div class="card" style="padding: 0; overflow: hidden;">
				<table class="data-table">
					<thead>
						<tr>
							<th>Orb</th>
							<th>Dungeon</th>
							<th>Floor</th>
							<th>Probability</th>
							<th>Making Cooldown</th>
							<th>Citation</th>
						</tr>
					</thead>
					<tbody>
						{#each data.drops as drop}
							<tr>
								<td><a href="/orbs/{drop.orb_slug}">{drop.orb_name}</a></td>
								<td>
									{#if drop.dungeon_slug}
										<a href="/dungeons/{drop.dungeon_slug}" class="entity-chip">{drop.dungeon}</a>
									{:else if drop.dungeon}{drop.dungeon}{:else}—{/if}
								</td>
								<td>{#if drop.floor}{@html drop.floor}{:else}—{/if}</td>
								<td>
									{#if drop.favorable_outcomes && drop.total_events}
										<span class="accent-num">{formatProbability(drop.favorable_outcomes, drop.total_events)}</span>
									{:else}—{/if}
								</td>
								<td>{formatCooldown(drop.total_events) || '—'}</td>
								<td>
									{#if drop.citation.volume}
										<span class="badge badge--citation">{formatCitation(drop.citation)}</span>
									{:else}—{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.monster-header__name-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}

	.category-badge {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 0.25em 0.65em;
		border-radius: 999px;
		background: var(--bg-subtle);
		color: var(--text-3);
		border: 1px solid var(--border);
	}

	.first-cite {
		font-size: 0.875rem;
		color: var(--text-3);
		margin-bottom: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.note-content :global(p) {
		font-size: 0.9375rem;
		color: var(--text-2);
		line-height: 1.7;
	}

	.md-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}
</style>
