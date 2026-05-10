<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let entityType = $state('character');
	let operation  = $state('update');
	let entityId   = $state('');
	let jsonInput  = $state('{}');
	let jsonError  = $state('');

	function validateJson() {
		try {
			JSON.parse(jsonInput);
			jsonError = '';
		} catch (e: unknown) {
			jsonError = e instanceof Error ? e.message : 'Invalid JSON';
		}
	}
</script>

<h1>Submit a Contribution</h1>
<p>All submissions are reviewed before being applied.</p>

{#if form?.success}
	<p>Submission received — thank you!</p>
{/if}

{#if form?.error}
	<p>Error: {form.error}</p>
{/if}

<form method="POST" action="?/submit">
	<label>
		Type
		<select name="entity_type" bind:value={entityType}>
			<option value="character">Character</option>
			<option value="character_stat">Character Stat</option>
			<option value="character_ranking">Character Ranking</option>
			<option value="character_orb">Character Orb</option>
			<option value="orb">Orb</option>
			<option value="orb_drop_rate">Orb Drop Rate</option>
			<option value="timeline_event">Timeline Event</option>
			<option value="dungeon">Dungeon</option>
		</select>
	</label>

	<label>
		Operation
		<select name="operation" bind:value={operation}>
			<option value="insert">New record</option>
			<option value="update">Update existing</option>
			<option value="delete">Delete</option>
		</select>
	</label>

	{#if operation !== 'insert'}
		<label>
			{entityType === 'character' || entityType === 'orb' || entityType === 'dungeon' ? 'Slug' : 'Record ID'}
			<input name="entity_id" bind:value={entityId} />
		</label>
	{/if}

	<label>
		Proposed data (JSON)
		<textarea
			name="proposed_data"
			rows="12"
			bind:value={jsonInput}
			oninput={validateJson}
		></textarea>
	</label>
	{#if jsonError}<p>{jsonError}</p>{/if}

	<button type="submit" disabled={!!jsonError}>Submit for review</button>
</form>
