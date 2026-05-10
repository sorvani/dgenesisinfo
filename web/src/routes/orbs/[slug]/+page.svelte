<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, formatProbability } from '$lib/utils';
	let { data }: { data: PageData } = $props();
</script>

<h1>{data.orb.orb_name}</h1>
{#if data.orb.known_effects}<p>{@html data.orb.known_effects}</p>{/if}

<h2>Drop Rates</h2>
{#each data.orb.drop_rates as dr}
	<p>{dr.dungeon ?? '?'} {dr.floor ? `· Floor ${dr.floor}` : ''} — {formatProbability(dr.favorable_outcomes, dr.total_events)}</p>
{/each}

{#if data.users.length}
	<h2>Known Users</h2>
	<ul>
	{#each data.users as c}
		<li><a href="/characters/{c.slug}">{getFullName(c)}</a></li>
	{/each}
	</ul>
{/if}
