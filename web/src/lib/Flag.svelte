<script lang="ts">
	const flagUrls = import.meta.glob('/node_modules/country-flag-icons/3x2/*.svg', {
		eager: true, query: '?url', import: 'default',
	}) as Record<string, string>;

	let { code }: { code: string | null | undefined } = $props();

	const url = $derived.by(() => {
		if (!code || code.length !== 2) return null;
		return flagUrls[`/node_modules/country-flag-icons/3x2/${code.toUpperCase()}.svg`] ?? null;
	});
</script>

{#if url}
	<img src={url} alt={code ?? ''} class="flag-icon" />
{/if}

<style>
	.flag-icon {
		display: inline-block;
		height: 0.85em;
		width: auto;
		vertical-align: -0.05em;
		border: 1px solid var(--border-soft);
		border-radius: 1px;
	}
</style>
