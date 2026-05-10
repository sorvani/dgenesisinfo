<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, getNationalityFlag } from '$lib/utils';
	let { data }: { data: PageData } = $props();
</script>

<h1>Explorers</h1>
<ul>
{#each data.characters as c}
	<li><a href="/characters/{c.slug}">{getNationalityFlag(c.nationality)} {getFullName(c)}</a></li>
{/each}
</ul>
