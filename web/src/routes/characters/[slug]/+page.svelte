<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, formatRank, getHistoricalRankingAt, formatDate, formatCitation } from '$lib/utils';
	let { data }: { data: PageData } = $props();
	const c = $derived(data.character);
</script>

<h1>{getFullName(c)}</h1>
{#if c.moniker}<p><em>"{c.moniker}"</em></p>{/if}
<p>Rank: {formatRank(getHistoricalRankingAt(c.rankings))}</p>
{#if c.note}<p>{@html c.note}</p>{/if}

<h2>Stats</h2>
{#each c.stats as s}
	<p>{formatDate(s.date_noted)} — STR {s.str} VIT {s.vit} INT {s.int} AGI {s.agi} DEX {s.dex} LUC {s.luc} · {formatCitation(s.citation)}</p>
{/each}
