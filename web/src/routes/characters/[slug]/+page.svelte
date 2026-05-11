<script lang="ts">
	import type { PageData } from './$types';
	import {
		getFullName, getNationalityFlag, formatDate, formatRank,
		getHistoricalRankingAt, formatCitation, formatProbability, formatCooldown
	} from '$lib/utils';
	import { renderMd } from '$lib/markdown';

	let { data }: { data: PageData } = $props();
	const c    = $derived(data.character);
	const orbs = $derived(data.orbs);

	// Look up orb details by DB id
	function getOrb(orbId: number) {
		return orbs.find(o => o.id === orbId) ?? null;
	}

	const latestRanking = $derived(getHistoricalRankingAt(c.rankings));
</script>

<svelte:head><title>{getFullName(c)} — D-Genesis Info</title></svelte:head>

<div class="container page">

	<!-- Back link -->
	<a href={c.is_explorer ? '/explorers' : '/characters'} class="back-link">
		← {c.is_explorer ? 'Explorers' : 'Characters'}
	</a>

	<!-- ── Header ── -->
	<div class="char-header">
		<div class="char-header__title-row">
			<h1 class="page-title">{getFullName(c)}</h1>
			{#if c.in_wdarl && !c.is_public}
				<span class="badge badge--anon">Anonymous on WDARL</span>
			{/if}
		</div>
		{#if c.moniker}
			<p class="char-moniker">"{c.moniker}"</p>
		{/if}

		<!-- Key facts row -->
		<div class="char-facts">
			{#if c.is_explorer && latestRanking}
				<div class="fact">
					<span class="fact__label">Rank</span>
					<span class="fact__value accent">{formatRank(latestRanking)}</span>
				</div>
			{/if}
			{#if c.sex}
				<div class="fact">
					<span class="fact__label">Sex</span>
					<span class="fact__value">{c.sex}</span>
				</div>
			{/if}
			{#if c.nationality}
				<div class="fact">
					<span class="fact__label">Nationality</span>
					<span class="fact__value">{getNationalityFlag(c.nationality)} {c.nationality}</span>
				</div>
			{/if}
			{#if c.birthday}
				<div class="fact">
					<span class="fact__label">Birthday</span>
					<span class="fact__value">{c.birthday}</span>
				</div>
			{/if}
			{#if c.date_first_known}
				<div class="fact">
					<span class="fact__label">First Known</span>
					<span class="fact__value">{formatDate(c.date_first_known)}</span>
				</div>
			{/if}
			{#if c.area}
				<div class="fact">
					<span class="fact__label">D-Card Area</span>
					<span class="fact__value">{c.area}</span>
				</div>
			{/if}
		</div>

		<!-- Tags -->
		{#if c.tags?.length}
			<div class="char-tags">
				{#each c.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>

	<!-- ── Note ── -->
	{#if c.note}
		<div class="data-section">
			<p class="section-heading">Note</p>
			<div class="md-content note-content">
				{@html renderMd(c.note)}
			</div>
		</div>
	{/if}

	<!-- ── Rankings (explorer only) ── -->
	{#if c.is_explorer && c.rankings.length}
		<div class="data-section">
			<p class="section-heading">Rankings</p>
			<div class="card" style="padding: 0; overflow: hidden;">
				<table class="data-table">
					<thead>
						<tr>
							<th>Rank</th>
							<th>Known Above</th>
							<th>Date Noted</th>
							<th>Citation</th>
						</tr>
					</thead>
					<tbody>
						{#each c.rankings as r}
							<tr>
								<td class="rank-cell">{r.rank ? '#' + r.rank.toLocaleString() : '—'}</td>
								<td>{r.known_above_rank ? r.known_above_rank.toLocaleString() : '—'}</td>
								<td>{formatDate(r.date_noted)}</td>
								<td>
									{#if r.citation.volume}
										<span class="badge badge--citation">{formatCitation(r.citation)}</span>
									{:else}—{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- ── Stat readings (explorer only) ── -->
	{#if c.is_explorer && c.stats.length}
		<div class="data-section">
			<p class="section-heading">Stat Readings</p>
			<div class="card" style="padding: 0; overflow: hidden; overflow-x: auto;">
				<table class="data-table stat-table">
					<thead>
						<tr>
							<th>Date</th>
							<th>Type</th>
							<th>HP</th>
							<th>MP</th>
							<th>SP</th>
							<th>STR</th>
							<th>VIT</th>
							<th>INT</th>
							<th>AGI</th>
							<th>DEX</th>
							<th>LUC</th>
							<th>Total</th>
							<th>Citation</th>
						</tr>
					</thead>
					<tbody>
						{#each c.stats as s}
							<tr>
								<td>{formatDate(s.date_noted)}</td>
								<td class="scan-type">{s.scan_type ?? '—'}</td>
								<td>{s.hp ?? '—'}</td>
								<td>{s.mp ?? '—'}</td>
								<td>{s.sp ?? '—'}</td>
								<td class="stat-val">{s.str ?? '—'}</td>
								<td class="stat-val">{s.vit ?? '—'}</td>
								<td class="stat-val">{s.int ?? '—'}</td>
								<td class="stat-val">{s.agi ?? '—'}</td>
								<td class="stat-val">{s.dex ?? '—'}</td>
								<td class="stat-val">{s.luc ?? '—'}</td>
								<td class="stat-total">{s.stat_total ?? '—'}</td>
								<td>
									{#if s.citation.volume}
										<span class="badge badge--citation">{formatCitation(s.citation)}</span>
									{:else}—{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- ── Orbs used (explorer only) ── -->
	{#if c.is_explorer && c.orbs_used.length}
		<div class="data-section">
			<p class="section-heading">Skill Orbs</p>
			<div class="card" style="padding: 0; overflow: hidden;">
				<table class="data-table">
					<thead>
						<tr>
							<th>Orb</th>
							<th>Date Acquired</th>
							<th>Citation</th>
						</tr>
					</thead>
					<tbody>
						{#each c.orbs_used as ou}
							{@const orb = getOrb(ou.orb_id)}
							<tr>
								<td>
									{#if orb}
										<a href="/orbs/{orb.slug}">{orb.orb_name}</a>
									{:else}
										Unknown
									{/if}
								</td>
								<td>{ou.date_acquired ? formatDate(ou.date_acquired) : (ou.date_note ?? '—')}</td>
								<td>
									{#if ou.citation.volume}
										<span class="badge badge--citation">{formatCitation(ou.citation)}</span>
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
	/* ── Header ── */
	.char-header {
		margin-bottom: 0.5rem;
	}

	.char-header__title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 0.25rem;
	}

	.char-moniker {
		font-size: 1rem;
		color: var(--text-3);
		font-style: italic;
		margin-bottom: 1rem;
	}

	.badge--anon {
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.25em 0.6em;
		border-radius: 999px;
		background: #fee;
		color: #c44;
		border: 1px solid #fcc;
	}

	/* Facts row */
	.char-facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 2rem;
		margin-bottom: 1rem;
	}

	.fact {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.fact__label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-3);
	}

	.fact__value {
		font-size: 0.9375rem;
		color: var(--text);
	}

	.fact__value.accent {
		color: var(--accent);
		font-family: var(--font-mono);
		font-weight: 700;
	}

	/* Tags */
	.char-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 0.5rem;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.2em 0.6em;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-3);
	}

	/* Note */
	.note-content :global(p) {
		font-size: 0.9375rem;
		color: var(--text-2);
		line-height: 1.7;
	}

	.note-content :global(p + p) { margin-top: 0.5rem; }

	/* Stat table */
	.stat-table th, .stat-table td { padding: 0.6rem 0.75rem; }

	.scan-type { font-size: 0.8125rem; color: var(--text-3); }

	.stat-val {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		text-align: right;
	}

	.stat-total {
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 0.875rem;
		color: var(--accent);
		text-align: right;
	}

	.rank-cell {
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--accent);
	}

	/* Markdown content */
	.md-content :global(p) {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--text-2);
	}

	.md-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}
</style>
