<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Dungeons</h1>
{#if data.dungeons.length === 0}
	<p>No dungeons recorded yet.</p>
{:else}
<ul>
{#each data.dungeons as d}
	<li><a href="/dungeons/{d.slug}">{d.name}</a> {d.country ? `(${d.country})` : ''}</li>
{/each}
</ul>
{/if}
