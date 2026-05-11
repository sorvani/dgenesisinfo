<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, formatRank, getHistoricalRankingAt, getRankSortValue, formatCitation, getCitationScore } from '$lib/utils';
	import type { Citation } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let selectedCitation = $state<Citation | null>(null);

	const displayed = $derived(
		data.characters
			.filter(c => getHistoricalRankingAt(c.rankings, selectedCitation ? getCitationScore(selectedCitation) : null) !== null)
			.sort((a, b) =>
				getRankSortValue(a.rankings, selectedCitation ? getCitationScore(selectedCitation) : null) -
				getRankSortValue(b.rankings, selectedCitation ? getCitationScore(selectedCitation) : null)
			)
	);
</script>

<h1>WDARL Rankings</h1>

<select onchange={(e) => {
	const idx = parseInt((e.target as HTMLSelectElement).value);
	selectedCitation = idx >= 0 ? data.citations[idx] : null;
}}>
	<option value="-1">Current</option>
	{#each data.citations as cit, i}
		<option value={i}>{formatCitation(cit)}</option>
	{/each}
</select>

<table>
	<thead><tr><th>Rank</th><th>Explorer</th></tr></thead>
	<tbody>
	{#each displayed as c}
		<tr>
			<td>{formatRank(getHistoricalRankingAt(c.rankings, selectedCitation ? getCitationScore(selectedCitation) : null))}</td>
			<td><a href="/characters/{c.slug}">{getFullName(c)}</a></td>
		</tr>
	{/each}
	</tbody>
</table>
