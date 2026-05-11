<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, formatProbability, formatCooldown, formatCitation } from '$lib/utils';
	import { renderMd } from '$lib/markdown';
	let { data }: { data: PageData } = $props();
	const orb = $derived(data.orb);
</script>

<svelte:head><title>{orb.orb_name} — D-Genesis Info</title></svelte:head>

<div class="container page">
	<a href="/orbs" class="back-link">← Skill Orbs</a>

	<div class="detail-title-row">
		<h1 class="page-title">{orb.orb_name}</h1>
		{#if data.user}
			<a href="/contribute?type=orb&op=update&id={orb.id}" class="action-edit">✏ Edit</a>
		{/if}
	</div>

	{#if orb.known_effects}
		<div class="data-section">
			<p class="section-heading">Known Effects</p>
			<div class="card md-content">
				{@html renderMd(orb.known_effects)}
			</div>
		</div>
	{/if}

	{#if orb.note}
		<div class="data-section">
			<p class="section-heading">Notes</p>
			<div class="md-content note-content">
				{@html renderMd(orb.note)}
			</div>
		</div>
	{/if}

	{#if orb.drop_rates.length}
		<div class="data-section">
			<p class="section-heading">Drop Rates</p>
			<div class="card" style="padding: 0; overflow: hidden;">
				<table class="data-table">
					<thead>
						<tr>
							<th>Dropped By</th>
							<th>Dungeon</th>
							<th>Floor</th>
							<th>Probability</th>
							<th>Making Cooldown</th>
							<th>Citation</th>
						</tr>
					</thead>
					<tbody>
						{#each orb.drop_rates as dr}
							<tr>
								<td>{dr.creature ?? '—'}</td>
								<td>
									{#if dr.dungeon_slug}
										<a href="/dungeons/{dr.dungeon_slug}" class="entity-chip">{dr.dungeon}</a>
									{:else if dr.dungeon}{dr.dungeon}{:else}—{/if}
								</td>
								<td>{#if dr.floor}{@html dr.floor}{:else}—{/if}</td>
								<td>
									{#if dr.favorable_outcomes && dr.total_events}
										<span class="accent-num">{formatProbability(dr.favorable_outcomes, dr.total_events)}</span>
									{:else}
										<span style="color: var(--text-3)">—</span>
									{/if}
								</td>
								<td>{formatCooldown(dr.total_events) || '—'}</td>
								<td>
									{#if dr.citation.volume}
										<span class="badge badge--citation">{formatCitation(dr.citation)}</span>
									{:else}
										<span style="color: var(--text-3)">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	{#if data.users.length}
		<div class="data-section">
			<p class="section-heading">Known Users</p>
			<div class="users-grid">
				{#each data.users as c}
					<a href="/characters/{c.slug}" class="user-chip">{getFullName(c)}</a>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Markdown-rendered content */
	.md-content :global(p) {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--text-2);
		margin: 0;
	}

	.md-content :global(p + p) { margin-top: 0.6rem; }

	.md-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
		color: var(--text);
	}

	.md-content :global(img) {
		height: 140px;
		width: auto;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		display: inline-block;
		margin-top: 0.75rem;
		margin-right: 0.75rem;
	}

	.md-content :global(ul), .md-content :global(ol) {
		padding-left: 1.25rem;
		font-size: 0.9375rem;
		color: var(--text-2);
	}

	.md-content :global(li + li) { margin-top: 0.25rem; }

	/* Notes: muted, no card box */
	.note-content :global(p) { color: var(--text-3); font-size: 0.875rem; }
	.note-content :global(code) { color: var(--text-2); }

	.users-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.user-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.75rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.875rem;
		color: var(--text);
		text-decoration: none;
		transition: border-color 0.15s, color 0.15s;
	}

	.user-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
		text-decoration: none;
	}
</style>
