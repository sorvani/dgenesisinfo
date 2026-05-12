<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, formatFloor } from '$lib/utils';
	import { renderMd } from '$lib/markdown';
	import { Pencil } from 'lucide-svelte';
	import Flag from '$lib/Flag.svelte';
	import Citation from '$lib/Citation.svelte';
	let { data }: { data: PageData } = $props();
	const d = $derived(data.dungeon);
</script>

<svelte:head><title>{d.name} — D-Genesis Info</title></svelte:head>

<div class="container page">
	<a href="/dungeons" class="back-link">← Dungeons</a>

	<div class="detail-title-row">
		<h1 class="page-title">{d.name}</h1>
		{#if data.user}
			<a href="/contribute?type=dungeon&op=update&id={d.id}" class="action-edit">✏ Edit</a>
		{/if}
	</div>

	<div class="meta-chips">
		{#if d.area_label || d.area != null}
			<div class="meta-chip meta-chip--accent">
				<span class="meta-chip__label">Area</span>
				<span class="meta-chip__value">{d.area_label ?? d.area}</span>
			</div>
		{/if}
		{#if d.country}
			<div class="meta-chip">
				<span class="meta-chip__label">Country</span>
				<span class="meta-chip__value"><Flag code={d.country} /> {d.country}</span>
			</div>
		{/if}
		{#if d.region}
			<div class="meta-chip">
				<span class="meta-chip__label">Region</span>
				<span class="meta-chip__value">{d.region}</span>
			</div>
		{/if}
		{#if d.floors != null}
			<div class="meta-chip">
				<span class="meta-chip__label">Known Floors</span>
				<span class="meta-chip__value">{d.floors}</span>
			</div>
		{/if}
		{#if d.discovered_date}
			<div class="meta-chip">
				<span class="meta-chip__label">Discovered</span>
				<span class="meta-chip__value">{formatDate(d.discovered_date)}</span>
			</div>
		{/if}
		{#if d.citation.volume}
			<div class="meta-chip">
				<span class="meta-chip__label">First Citation</span>
				<div class="meta-chip__value-row">
					<Citation citation={d.citation} />
				</div>
			</div>
		{/if}
	</div>

	{#if !d.is_active}
		<p class="inactive-note">This dungeon is no longer active.</p>
	{/if}

	{#if d.note}
		<div class="data-section">
			<p class="section-heading">Notes</p>
			<div class="md-content note-content">
				{@html renderMd(d.note)}
			</div>
		</div>
	{/if}

	{#if data.creatures.length || data.user}
		<div class="data-section">
			<div class="section-head-row">
				<p class="section-heading">Creatures Found Here</p>
				{#if data.user}
					<a href="/contribute?type=monster_dungeon&op=insert&dungeon_id={d.id}" class="action-add action-add--inline">+ Add</a>
				{/if}
			</div>
			{#if data.creatures.length}
				<div class="card" style="padding: 0; overflow: hidden; margin-top: 0.75rem;">
					<table class="data-table">
						<thead>
							<tr>
								<th>Creature</th><th>Floor</th><th>Citation</th>
								{#if data.user}<th class="row-edit-col"></th>{/if}
							</tr>
						</thead>
						<tbody>
							{#each data.creatures as c}
								<tr>
									<td><a href="/bestiary/{c.monster_slug}">{c.monster_name}</a></td>
									<td>{#if c.floor}{@html formatFloor(c.floor)}{:else}—{/if}</td>
									<td>{#if c.citation.volume}<Citation citation={c.citation} />{:else}—{/if}</td>
									{#if data.user}
										<td class="row-edit-col">
											<a href="/contribute?type=monster_dungeon&op=update&id={c.id}" class="row-edit" title="Edit">
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
				<p class="empty-section">No creatures recorded yet.</p>
			{/if}
		</div>
	{/if}

	{#if data.orbs.length}
		<div class="data-section">
			<p class="section-heading">Orbs Found Here</p>
			<div class="chip-group">
				{#each data.orbs as o}
					<a href="/orbs/{o.slug}">
						{o.orb_name}{#if o.floor}<span class="chip-floor">{@html formatFloor(o.floor)}</span>{/if}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.meta-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.meta-chip {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.4rem 0.75rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.meta-chip--accent {
		background: var(--accent-bg);
		border-color: #f0c090;
	}

	.meta-chip__label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-3);
	}

	.meta-chip--accent .meta-chip__label { color: var(--accent-dark); }

	.meta-chip__value {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text);
	}

	.meta-chip--accent .meta-chip__value {
		color: var(--accent);
		font-family: var(--font-mono);
	}

	.meta-chip__value-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
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

	.chip-floor {
		font-size: 0.75rem;
		color: var(--text-3);
		margin-left: 0.35rem;
	}

	.inactive-note {
		font-size: 0.875rem;
		color: var(--text-3);
		font-style: italic;
		margin-bottom: 1rem;
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
