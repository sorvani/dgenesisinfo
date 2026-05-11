<script lang="ts">
	import type { PageData } from './$types';
	import { formatProbability, formatCooldown, formatFloor } from '$lib/utils';
	import { renderMd } from '$lib/markdown';
	import { Pencil } from 'lucide-svelte';
	import Citation from '$lib/Citation.svelte';
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
			First cited: <Citation citation={m.citation} />
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

	{#if data.dungeons.length || data.user}
		<div class="data-section">
			<div class="section-head-row">
				<p class="section-heading">Found In</p>
				{#if data.user}
					<a href="/contribute?type=monster_dungeon&op=insert&monster_id={m.id}" class="action-add action-add--inline">+ Add</a>
				{/if}
			</div>
			{#if data.dungeons.length}
				<div class="card" style="padding: 0; overflow: hidden; margin-top: 0.75rem;">
					<table class="data-table">
						<thead>
							<tr>
								<th>Dungeon</th><th>Floor</th><th>Citation</th>
								{#if data.user}<th class="row-edit-col"></th>{/if}
							</tr>
						</thead>
						<tbody>
							{#each data.dungeons as loc}
								<tr>
									<td><a href="/dungeons/{loc.dungeon_slug}">{loc.dungeon_name}</a></td>
									<td>{#if loc.floor}{@html formatFloor(loc.floor)}{:else}—{/if}</td>
									<td>{#if loc.citation.volume}<Citation citation={loc.citation} />{:else}—{/if}</td>
									{#if data.user}
										<td class="row-edit-col">
											<a href="/contribute?type=monster_dungeon&op=update&id={loc.id}" class="row-edit" title="Edit">
												<Pencil size={16} strokeWidth={2} />
											</a>
										</td>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="empty-section">No dungeons recorded yet.</p>
			{/if}
		</div>
	{/if}

	{#if data.drops.length || data.user}
		<div class="data-section">
			<div class="section-head-row">
				<p class="section-heading">Orb Drops</p>
				{#if data.user}
					<a href="/contribute?type=orb_drop_rate&op=insert&monster_id={m.id}" class="action-add action-add--inline">+ Add</a>
				{/if}
			</div>
			{#if data.drops.length}
			<div class="card" style="padding: 0; overflow: hidden; margin-top: 0.75rem;">
				<table class="data-table">
					<thead>
						<tr>
							<th>Orb</th>
							<th>Dungeon</th>
							<th>Floor</th>
							<th>Probability</th>
							<th>Making Cooldown</th>
							<th>Citation</th>
							{#if data.user}<th class="row-edit-col"></th>{/if}
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
								<td>{#if drop.floor}{@html formatFloor(drop.floor)}{:else}—{/if}</td>
								<td>
									{#if drop.favorable_outcomes && drop.total_events}
										<span class="accent-num">{formatProbability(drop.favorable_outcomes, drop.total_events)}</span>
									{:else}—{/if}
								</td>
								<td>{formatCooldown(drop.total_events) || '—'}</td>
								<td>
									{#if drop.citation.volume}
										<Citation citation={drop.citation} />
									{:else}—{/if}
								</td>
								{#if data.user}
									<td class="row-edit-col">
										<a href="/contribute?type=orb_drop_rate&op=update&id={drop.id}" class="row-edit" title="Edit">
											<Pencil size={16} strokeWidth={2} />
										</a>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{:else}
				<p class="empty-section">No orb drops recorded yet.</p>
			{/if}
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

	.section-head-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.action-add--inline { padding: 0.15rem 0.55rem; font-size: 0.75rem; }

	.row-edit-col { width: 1px; white-space: nowrap; text-align: right; }

	.row-edit {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		color: var(--text-3);
		text-decoration: none;
		border-radius: var(--radius);
		transition: background 0.15s, color 0.15s;
	}

	.row-edit:hover { background: var(--bg-subtle); color: var(--accent); text-decoration: none; }

	.empty-section {
		font-size: 0.875rem;
		color: var(--text-3);
		font-style: italic;
		margin-top: 0.75rem;
	}
</style>
