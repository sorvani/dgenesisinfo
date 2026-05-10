<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>D-Genesis Info</h1>
<p>{data.stats.characters} explorers · {data.stats.orbs} orbs · {data.stats.timeline} timeline events · {data.stats.stats} stat entries</p>
