<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let entityType = $state(data.defaultType);
	let operation  = $state(data.defaultOp);
	let entityId   = $state(data.defaultEntityId ?? '');
	let jsonInput  = $state(data.prefill);
	let jsonError  = $state('');

	function validateJson() {
		try { JSON.parse(jsonInput); jsonError = ''; }
		catch (e: unknown) { jsonError = e instanceof Error ? e.message : 'Invalid JSON'; }
	}
</script>

<svelte:head><title>Contribute — D-Genesis Info</title></svelte:head>

<div class="container page">
	<h1 class="page-title">Submit a Contribution</h1>
	<p class="page-subtitle">All submissions are reviewed by an admin before being applied.</p>

	{#if form?.success}
		<div class="success-banner">Submission received — thank you!</div>
	{/if}
	{#if form?.error}
		<div class="error-banner">{form.error}</div>
	{/if}

	<form method="POST" action="?/submit" class="contribute-form card">
		<div class="form-row">
			<label class="form-field">
				<span class="form-label">Type</span>
				<select name="entity_type" bind:value={entityType}>
					<option value="character">Character / Explorer</option>
					<option value="character_stat">Character Stat</option>
					<option value="character_ranking">Character Ranking</option>
					<option value="character_orb">Character Orb</option>
					<option value="orb">Orb</option>
					<option value="orb_drop_rate">Orb Drop Rate</option>
					<option value="timeline_event">Timeline Event</option>
					<option value="dungeon">Dungeon</option>
					<option value="monster">Monster</option>
				</select>
			</label>

			<label class="form-field">
				<span class="form-label">Operation</span>
				<select name="operation" bind:value={operation}>
					<option value="insert">New record</option>
					<option value="update">Update existing</option>
					<option value="delete">Delete</option>
				</select>
			</label>

			{#if operation !== 'insert'}
				<label class="form-field">
					<span class="form-label">Record ID</span>
					<input name="entity_id" bind:value={entityId} placeholder="numeric ID" />
				</label>
			{/if}
		</div>

		<label class="form-field">
			<span class="form-label">Proposed data <span class="form-label-hint">(Markdown supported in text fields)</span></span>
			<textarea
				name="proposed_data"
				rows="16"
				bind:value={jsonInput}
				oninput={validateJson}
				class="json-input"
				spellcheck="false"
			></textarea>
		</label>

		{#if jsonError}
			<p class="json-error">{jsonError}</p>
		{/if}

		<div class="form-footer">
			<button type="submit" class="btn btn--primary" disabled={!!jsonError}>Submit for review</button>
		</div>
	</form>
</div>

<style>
	.success-banner {
		background: #d1fae5;
		color: #065f46;
		border: 1px solid #6ee7b7;
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.9375rem;
	}

	.error-banner {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.9375rem;
	}

	.contribute-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin-top: 1.5rem;
	}

	.form-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		flex: 1;
		min-width: 160px;
	}

	.form-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-3);
	}

	.form-label-hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--text-3);
	}

	select, input {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text);
		font-size: 0.9375rem;
		width: 100%;
	}

	.json-input {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-subtle);
		color: var(--text);
		width: 100%;
		resize: vertical;
		line-height: 1.6;
	}

	.json-error {
		font-size: 0.875rem;
		color: #dc2626;
		font-family: var(--font-mono);
	}

	.form-footer { display: flex; justify-content: flex-end; }
</style>
