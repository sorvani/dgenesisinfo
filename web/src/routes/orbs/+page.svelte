<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Skill Orbs</h1>
<ul>
{#each data.orbs as orb}
	<li><a href="/orbs/{orb.slug}">{orb.orb_name}</a></li>
{/each}
</ul>
