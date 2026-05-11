<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, formatCitation, getNationalityFlag } from '$lib/utils';
	import { renderMd } from '$lib/markdown';
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
				<span class="meta-chip__value">{getNationalityFlag(d.country)} {d.country}</span>
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
					<span class="badge badge--citation">{formatCitation(d.citation)}</span>
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

	{#if data.beasts.length}
		<div class="data-section">
			<p class="section-heading">Creatures Found Here</p>
			<div class="chip-group">
				{#each data.beasts as b}
					<a href="/bestiary/{b.slug}" class="entity-chip">{b.name}</a>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.orbs.length}
		<div class="data-section">
			<p class="section-heading">Orbs Found Here</p>
			<div class="chip-group">
				{#each data.orbs as o}
					<a href="/orbs/{o.slug}" class="entity-chip">
						{o.orb_name}{#if o.floor}<span class="chip-floor">{@html o.floor}</span>{/if}
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
