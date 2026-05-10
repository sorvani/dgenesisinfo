<script lang="ts">
	import type { PageData } from './$types';
	import { getTimelineEventDate } from '$lib/utils';
	let { data }: { data: PageData } = $props();
</script>

<h1>Timeline</h1>
{#each data.events as ev}
	<div>
		<strong>{getTimelineEventDate(ev)}</strong>
		<p>{@html ev.event}</p>
	</div>
{/each}
