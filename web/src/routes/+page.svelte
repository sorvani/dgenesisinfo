<script lang="ts">
	import type { PageData } from './$types';
	import {
		getFullName, formatRank,
		getHistoricalRankingAt, getRankSortValue,
		formatCitation, getCitationScore
	} from '$lib/utils';
	import type { Citation } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let selectedCitation = $state<Citation | null>(null);

	const displayed = $derived(
		data.wdarl
			.filter(c => {
				const score = selectedCitation ? getCitationScore(selectedCitation) : null;
				const r = getHistoricalRankingAt(c.rankings, score);
				return r !== null && r.rank !== null;
			})
			.sort((a, b) => {
				const score = selectedCitation ? getCitationScore(selectedCitation) : null;
				return getRankSortValue(a.rankings, score) - getRankSortValue(b.rankings, score);
			})
	);

	function displayName(c: (typeof data.wdarl)[0]): string {
		// Use first name only for public explorers, matching the in-universe list format
		return c.first_name ?? getFullName(c);
	}
</script>

<svelte:head><title>D-Genesis Stats — WDARL</title></svelte:head>

<div class="container page">
	<div class="home-header">
		<h1 class="home-title"><span>D-Genesis</span> Stats</h1>
		<p class="home-sub">A fan-maintained reference database for <em>D-Genesis: Three Years after the Dungeons Appeared</em>.</p>
	</div>

	<div class="wdarl-card card">
		<div class="wdarl-header">
			<div>
				<div class="wdarl-title-row">
					<span class="wdarl-label">WDARL</span>
					<span class="wdarl-full">World Dungeon Association Ranking List</span>
				</div>
				<div class="wdarl-sub">Simultaneously Translated Chat</div>
			</div>
			<select class="citation-select" onchange={(e) => {
				const idx = parseInt((e.target as HTMLSelectElement).value);
				selectedCitation = idx >= 0 ? data.citations[idx] : null;
			}}>
				<option value="-1">Current (Latest Known)</option>
				{#each data.citations as cit, i}
					<option value={i}>{formatCitation(cit)}</option>
				{/each}
			</select>
		</div>

		<table class="wdarl-table">
			<thead>
				<tr>
					<th class="col-rank">Rank</th>
					<th class="col-area">Area</th>
					<th class="col-cc">CC</th>
					<th class="col-name">Name</th>
				</tr>
			</thead>
			<tbody>
				{#each displayed as c}
					{@const score = selectedCitation ? getCitationScore(selectedCitation) : null}
					{@const ranking = getHistoricalRankingAt(c.rankings, score)}
					<tr class:anon={!c.is_public}>
						<td class="col-rank">{ranking?.rank?.toLocaleString()}</td>
						<td class="col-area">{c.area ?? '—'}</td>
						<td class="col-cc">{c.is_public ? (c.nationality ?? '') : ''}</td>
						<td class="col-name">
							{#if !c.is_public}
								<span class="anon-star">✦</span>
								<a href="/characters/{c.slug}" class="anon-name">({displayName(c)})</a>
							{:else}
								<a href="/characters/{c.slug}">{displayName(c)}</a>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	/* ── Header ── */
	.home-header { margin-bottom: 1.75rem; }

	.home-title {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin-bottom: 0.25rem;
	}

	.home-title span { color: var(--accent); }

	.home-sub {
		font-size: 0.875rem;
		color: var(--text-3);
		max-width: 520px;
	}

	/* ── WDARL card ── */
	.wdarl-card {
		padding: 0;
		overflow: hidden;
	}

	.wdarl-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border);
		gap: 1rem;
		flex-wrap: wrap;
	}

	.wdarl-title-row {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	.wdarl-label {
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		color: var(--accent);
	}

	.wdarl-full {
		font-size: 0.875rem;
		color: var(--text-2);
		font-weight: 500;
	}

	.wdarl-sub {
		font-size: 0.75rem;
		color: var(--text-3);
		margin-top: 0.1rem;
	}

	.citation-select {
		font-size: 0.8125rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text);
		cursor: pointer;
	}

	/* ── Table ── */
	.wdarl-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
		font-family: var(--font-mono);
	}

	.wdarl-table th {
		text-align: left;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--text-3);
		padding: 0.625rem 1rem;
		border-bottom: 2px solid var(--border);
	}

	.wdarl-table td {
		padding: 0.6rem 1rem;
		border-bottom: 1px solid var(--border-soft);
		vertical-align: middle;
	}

	.wdarl-table tbody tr:last-child td { border-bottom: none; }
	.wdarl-table tbody tr:hover { background: var(--bg-subtle); }

	/* Column widths */
	.col-rank { width: 70px; text-align: right; }
	.col-area { width: 60px; text-align: center; color: var(--text-3); }
	.col-cc   { width: 50px; text-align: center; color: var(--text-2); letter-spacing: 0.05em; }
	.col-name { }

	/* Rank number */
	.wdarl-table td.col-rank {
		font-weight: 700;
		color: var(--accent);
	}

	/* Anonymous rows */
	.anon-star {
		color: var(--accent);
		font-size: 0.625rem;
		margin-right: 0.3rem;
		vertical-align: middle;
	}

	.anon-name {
		color: var(--text-3);
		font-style: italic;
		font-size: 0.875rem;
	}

	.wdarl-table a {
		color: var(--text);
		text-decoration: none;
	}

	.wdarl-table a:hover { color: var(--accent); }
</style>
