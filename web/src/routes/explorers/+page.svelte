<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, getNationalityFlag, formatRank, getHistoricalRankingAt } from '$lib/utils';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Explorers — D-Genesis Info</title></svelte:head>

<div class="container page">
	<div class="page-header">
		<h1 class="page-title">Explorers</h1>
		<span class="page-count"><em>{data.explorers.length} known explorers</em></span>
	</div>

	<div class="card-grid">
		{#each data.explorers as c}
			<a href="/characters/{c.slug}" class="explorer-card">
				<div class="explorer-card__rank">
					{formatRank(getHistoricalRankingAt(c.rankings))}
				</div>
				<div class="explorer-card__name">
					{getNationalityFlag(c.nationality)} {getFullName(c)}
					{#if c.moniker}<span class="explorer-card__moniker">"{c.moniker}"</span>{/if}
				</div>
				{#if c.tags?.length}
					<div class="explorer-card__tags">
						{#each c.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</a>
		{/each}
	</div>
</div>

<style>
	.page-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.75rem;
	}

	.page-count {
		font-size: 0.875rem;
		color: var(--text-3);
	}

	.explorer-card {
		background: var(--bg-card);
		border: 2px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-card);
		transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, background 0.15s;
	}

	.explorer-card:hover {
		border-color: var(--accent);
		background: var(--accent-bg);
		box-shadow: var(--shadow-hover);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.explorer-card__rank {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--accent);
	}

	.explorer-card__name {
		font-weight: 700;
		font-size: 0.9375rem;
		color: var(--text);
	}

	.explorer-card__moniker {
		font-weight: 400;
		font-size: 0.8125rem;
		color: var(--text-3);
		margin-left: 0.25rem;
	}

	.explorer-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.25rem;
	}

	.tag {
		font-size: 0.6875rem;
		padding: 0.15em 0.5em;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-3);
	}
</style>
