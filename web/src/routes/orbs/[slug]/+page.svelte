<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, formatProbability, formatCooldown, formatCitation } from '$lib/utils';
	let { data }: { data: PageData } = $props();
	const orb = $derived(data.orb);

	function formatEffects(html: string | null): string[] {
		if (!html) return [];
		return html.split(/<br\s*\/?>/gi).map(s => s.trim()).filter(Boolean);
	}
</script>

<svelte:head><title>{orb.orb_name} — D-Genesis Info</title></svelte:head>

<div class="container page">
	<a href="/orbs" class="back-link">← Skill Orbs</a>

	<h1 class="page-title">{orb.orb_name}</h1>

	{#if orb.known_effects}
		<div class="data-section">
			<p class="section-heading">Known Effects</p>
			<div class="card">
				{#each formatEffects(orb.known_effects) as line}
					<p class="rich-text">{@html line}</p>
				{/each}
			</div>
		</div>
	{/if}

	{#if orb.note}
		<div class="data-section">
			<p class="section-heading">Notes</p>
			<div class="notes-body">
				{#each formatEffects(orb.note) as line}
					<p class="note-line">{@html line}</p>
				{/each}
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
								<td>{dr.dungeon ?? '—'}</td>
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
					<a href="/characters/{c.slug}" class="user-chip">
						{getFullName(c)}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.notes-body {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.note-line {
		font-size: 0.875rem;
		color: var(--text-3);
		line-height: 1.6;
	}

	.card .rich-text + .rich-text {
		margin-top: 0.5rem;
	}

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
