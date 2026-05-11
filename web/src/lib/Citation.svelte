<script lang="ts">
	import { formatCitation, getCitationUrl, type Citation } from '$lib/utils';

	let { citation }: { citation: Citation | null } = $props();

	const text = $derived(citation ? formatCitation(citation) : '');
	const url  = $derived(getCitationUrl(citation));
</script>

{#if citation?.volume}
	{#if url}
		<a href={url} target="_blank" rel="noopener noreferrer" class="badge badge--citation">{text}</a>
	{:else}
		<span class="badge badge--citation">{text}</span>
	{/if}
{/if}
