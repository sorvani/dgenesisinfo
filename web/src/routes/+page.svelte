<script lang="ts">
	import type { PageData } from './$types';
	import {
		getFullName, getNationalityFlag, formatRank,
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
</script>

<svelte:head><title>D-Genesis Info — World Dungeon Association Ranking List</title></svelte:head>

<div class="container page">
	<div class="home-header">
		<div class="home-blurb">
			<h1 class="home-title"><span>D-Genesis</span> Info</h1>
			<p>A fan-maintained reference database for <em>D-Genesis: Three Years after the Dungeons Appeared</em>. Tracking explorer rankings, combat statistics, skill orbs, and more from the light novel series.</p>
		</div>
	</div>

	<div class="wdarl-card card">
		<div class="wdarl-header">
			<div>
				<h2 class="wdarl-title">WDARL</h2>
				<p class="wdarl-subtitle">World Dungeon Association Ranking List</p>
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

		<table class="data-table wdarl-table">
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
					<tr>
						<td class="col-rank rank-num">#{ranking?.rank?.toLocaleString()}</td>
						<td class="col-area">{c.area ?? '—'}</td>
						<td class="col-cc">{getNationalityFlag(c.nationality)} {c.nationality ?? ''}</td>
						<td class="col-name">
							{#if !c.is_public}
								<span class="anon-marker" title="Anonymous on WDARL">✦</span>
								<a href="/characters/{c.slug}" class="anon-name">({getFullName(c)})</a>
							{:else}
								<a href="/characters/{c.slug}">{getFullName(c)}</a>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.home-header {
		margin-bottom: 2rem;
	}

	.home-title {
		font-size: 2.25rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin-bottom: 0.5rem;
	}

	.home-title span { color: var(--accent); }

	.home-blurb p {
		font-size: 0.9375rem;
		color: var(--text-2);
		max-width: 600px;
		line-height: 1.6;
	}

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

	.wdarl-title {
		font-size: 1rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		color: var(--accent);
		margin-bottom: 0.1rem;
	}

	.wdarl-subtitle {
		font-size: 0.75rem;
		color: var(--text-3);
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

	.wdarl-table .col-rank { width: 80px; text-align: right; }
	.wdarl-table .col-area { width: 60px; text-align: center; }
	.wdarl-table .col-cc   { width: 80px; }
	.wdarl-table .col-name { }

	.rank-num {
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--accent);
		font-size: 0.9375rem;
	}

	.anon-marker {
		color: var(--accent);
		font-size: 0.625rem;
		vertical-align: middle;
		margin-right: 0.25rem;
	}

	.anon-name {
		color: var(--text-3);
		font-style: italic;
	}
</style>
