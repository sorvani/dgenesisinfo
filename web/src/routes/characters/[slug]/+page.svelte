<script lang="ts">
	import type { PageData } from './$types';
	import {
		getFullName, getNationalityFlag, formatDate, formatRank,
		getHistoricalRankingAt, formatCitation, getCitationScore
	} from '$lib/utils';
	import { renderMd } from '$lib/markdown';

	let { data }: { data: PageData } = $props();
	const c    = $derived(data.character);
	const orbs = $derived(data.orbs);

	function getOrb(orbId: number) {
		return orbs.find(o => o.id === orbId) ?? null;
	}

	const latestRanking      = $derived(getHistoricalRankingAt(c.rankings));
	const firstKnownCitation = $derived(c.cite_first_known?.volume ? c.cite_first_known : null);

	// Most recent first — rankings use citation score as the sort key
	const sortedRankings = $derived(
		[...c.rankings].sort((a, b) => getCitationScore(b.citation) - getCitationScore(a.citation))
	);

	// Most recent first — stats use date then sequence
	const sortedStats = $derived(
		[...c.stats].sort((a, b) => {
			const da = a.date_noted ?? '', db = b.date_noted ?? '';
			if (db !== da) return db.localeCompare(da);
			return (b.date_sequence ?? 1) - (a.date_sequence ?? 1);
		})
	);
</script>

<svelte:head><title>{getFullName(c)} — D-Genesis Info</title></svelte:head>

<div class="container page">

	<a href={c.is_explorer ? '/explorers' : '/characters'} class="back-link">
		← {c.is_explorer ? 'Explorers' : 'Characters'}
	</a>

	<!-- ── Hero header ── -->
	<div class="char-hero__name-row">
		<h1 class="char-name">{getFullName(c)}</h1>
		{#if c.in_wdarl && !c.is_public}
			<span class="anon-badge">✦ Anonymous on WDARL</span>
		{/if}
	</div>
	{#if c.moniker}
		<p class="char-moniker">"{c.moniker}"</p>
	{/if}

	{#if c.tags?.length}
		<div class="char-tags">
			{#each c.tags as tag}<span class="tag">{tag}</span>{/each}
		</div>
	{/if}

	<!-- Metadata chips -->
	<div class="meta-chips">
		{#if c.is_explorer && latestRanking}
			<div class="meta-chip meta-chip--accent">
				<span class="meta-chip__label">Rank</span>
				<span class="meta-chip__value">{formatRank(latestRanking)}</span>
			</div>
		{/if}
		{#if c.sex}
			<div class="meta-chip">
				<span class="meta-chip__label">Sex</span>
				<span class="meta-chip__value">{c.sex === 'Male' ? '♂' : c.sex === 'Female' ? '♀' : c.sex}</span>
			</div>
		{/if}
		{#if c.nationality}
			<div class="meta-chip">
				<span class="meta-chip__label">Nationality</span>
				<span class="meta-chip__value">{getNationalityFlag(c.nationality)} {c.nationality}</span>
			</div>
		{/if}
		{#if c.area}
			<div class="meta-chip">
				<span class="meta-chip__label">Area</span>
				<span class="meta-chip__value">{c.area}</span>
			</div>
		{/if}
		{#if c.birthday}
			<div class="meta-chip">
				<span class="meta-chip__label">Birthday</span>
				<span class="meta-chip__value">🎂 {c.birthday}</span>
			</div>
		{/if}
		{#if c.date_first_known}
			<div class="meta-chip">
				<span class="meta-chip__label">First Known</span>
				<div class="meta-chip__value-row">
					<span class="meta-chip__value">{formatDate(c.date_first_known)}</span>
					{#if firstKnownCitation?.volume}
						<span class="badge badge--citation">{formatCitation(firstKnownCitation)}</span>
					{/if}
				</div>
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

	<!-- ── Rankings ── -->
	{#if c.is_explorer && sortedRankings.length}
		<div class="data-section">
			<details open>
				<summary class="section-heading collapsible">Rankings</summary>
				<div class="card" style="padding: 0; overflow: hidden; margin-top: 0.75rem;">
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
							{#each sortedRankings as r}
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
			</details>
		</div>
	{/if}

	<!-- ── Stats ── -->
	{#if c.is_explorer && sortedStats.length}
		<div class="data-section">
			<details open>
				<summary class="section-heading collapsible">Stat Readings</summary>
				<div class="card" style="padding: 0; overflow: hidden; overflow-x: auto; margin-top: 0.75rem;">
					<table class="data-table stat-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Seq</th>
								<th>Type</th>
								<th>STR</th>
								<th>VIT</th>
								<th>INT</th>
								<th>AGI</th>
								<th>DEX</th>
								<th>LUC</th>
								<th>Total</th>
								<th>HP</th>
								<th>MP</th>
								<th>SP</th>
								<th>Citation</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedStats as s}
								<tr>
									<td>{formatDate(s.date_noted)}</td>
									<td class="seq-cell">{s.date_sequence}</td>
									<td class="scan-type">{s.scan_type ?? '—'}</td>
									<td class="stat-val">{s.str ?? '—'}</td>
									<td class="stat-val">{s.vit ?? '—'}</td>
									<td class="stat-val">{s.int ?? '—'}</td>
									<td class="stat-val">{s.agi ?? '—'}</td>
									<td class="stat-val">{s.dex ?? '—'}</td>
									<td class="stat-val">{s.luc ?? '—'}</td>
									<td class="stat-total">{s.stat_total ?? '—'}</td>
									<td class="stat-val">{s.hp ?? '—'}</td>
									<td class="stat-val">{s.mp ?? '—'}</td>
									<td class="stat-val">{s.sp ?? '—'}</td>
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
			</details>
		</div>
	{/if}

	<!-- ── Orbs ── -->
	{#if c.is_explorer && c.orbs_used.length}
		<div class="data-section">
			<details open>
				<summary class="section-heading collapsible">Skill Orbs</summary>
				<div class="card" style="padding: 0; overflow: hidden; margin-top: 0.75rem;">
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
										{:else}Unknown{/if}
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
			</details>
		</div>
	{/if}

</div>

<style>
	/* ── Hero ── */
	.char-hero__name-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 0.25rem;
	}

	.char-name {
		font-size: 2.5rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}

	.anon-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.3em 0.75em;
		border-radius: 999px;
		background: #fee2e2;
		color: #b91c1c;
		border: 1px solid #fca5a5;
		white-space: nowrap;
	}

	.char-moniker {
		font-size: 1.0625rem;
		color: var(--text-3);
		font-style: italic;
		margin-bottom: 0.5rem;
	}

	/* ── Tags (near name) ── */
	.char-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.2em 0.6em;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-3);
	}

	/* ── Metadata chips ── */
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
		line-height: 1.2;
	}

	.meta-chip--accent .meta-chip__value {
		color: var(--accent);
		font-family: var(--font-mono);
	}

	.meta-chip__value-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
	}

	/* ── Collapsible sections ── */
	details { border: none; }

	summary.collapsible {
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		user-select: none;
	}

	summary.collapsible::after {
		content: '▾';
		font-size: 0.75rem;
		color: var(--text-3);
		transition: transform 0.15s;
	}

	details:not([open]) summary.collapsible::after {
		transform: rotate(-90deg);
	}

	summary::-webkit-details-marker { display: none; }

	/* ── Note ── */
	.note-content :global(p) {
		font-size: 0.9375rem;
		color: var(--text-2);
		line-height: 1.7;
	}

	.note-content :global(p + p) { margin-top: 0.5rem; }

	/* ── Markdown ── */
	.md-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}

	/* ── Stat table ── */
	.stat-table th, .stat-table td { padding: 0.55rem 0.75rem; }

	.seq-cell {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-3);
		text-align: center;
	}

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
</style>
