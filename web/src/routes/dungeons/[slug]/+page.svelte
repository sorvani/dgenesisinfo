<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, formatCitation } from '$lib/utils';
	let { data }: { data: PageData } = $props();
	const d = $derived(data.dungeon);
</script>

<h1>{d.name}</h1>
{#if d.country}<p>Country: {d.country}{d.region ? ` · ${d.region}` : ''}</p>{/if}
{#if d.discovered_date}<p>Discovered: {formatDate(d.discovered_date)}</p>{/if}
{#if d.floors}<p>Known floors: {d.floors}</p>{/if}
{#if d.note}<p>{@html d.note}</p>{/if}
{#if d.citation.volume}<p><em>{formatCitation(d.citation)}</em></p>{/if}
