<script lang="ts">
	import { X } from 'lucide-svelte';

	let {
		query = $bindable(''),
		tags  = $bindable<string[]>([]),
		placeholder = 'Filter by name, tag, or moniker…',
		resultCount,
		totalCount,
	}: {
		query?: string;
		tags?: string[];
		placeholder?: string;
		resultCount?: number;
		totalCount?: number;
	} = $props();

	function removeTag(t: string) {
		tags = tags.filter(x => x !== t);
	}

	function clearAll() {
		query = '';
		tags = [];
	}

	const hasActive = $derived(query.trim().length > 0 || tags.length > 0);
</script>

<div class="filter-bar">
	<input
		type="search"
		class="filter-search"
		{placeholder}
		bind:value={query}
	/>

	{#each tags as t (t)}
		<span class="filter-chip">
			<span class="filter-chip__label">tag:</span>
			<span class="filter-chip__value">{t}</span>
			<button type="button" class="filter-chip__remove" onclick={() => removeTag(t)} aria-label="Remove filter">
				<X size={12} strokeWidth={2.75} />
			</button>
		</span>
	{/each}

	{#if hasActive}
		<button type="button" class="filter-clear" onclick={clearAll}>Clear all</button>
	{/if}

	{#if hasActive && resultCount !== undefined && totalCount !== undefined}
		<span class="filter-count">{resultCount} of {totalCount}</span>
	{/if}
</div>

<style>
	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 1.25rem;
	}

	.filter-search {
		flex: 1 1 240px;
		min-width: 200px;
		max-width: 360px;
		padding: 0.45rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text);
		font-size: 0.9rem;
		font-family: var(--font-sans);
	}

	.filter-search:focus {
		outline: none;
		border-color: var(--accent);
	}

	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.4rem 0.25rem 0.6rem;
		background: var(--accent-bg);
		color: var(--accent-dark, var(--accent));
		border: 1px solid var(--accent);
		border-radius: 999px;
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.filter-chip__label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.7;
	}

	.filter-chip__value { font-weight: 600; }

	.filter-chip__remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		border-radius: 999px;
		padding: 0;
	}

	.filter-chip__remove:hover {
		background: rgba(0, 0, 0, 0.08);
	}

	.filter-clear {
		background: none;
		border: none;
		color: var(--text-3);
		font-size: 0.8125rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		text-decoration: underline;
	}

	.filter-clear:hover { color: var(--accent); }

	.filter-count {
		font-size: 0.8125rem;
		color: var(--text-3);
		margin-left: auto;
	}
</style>
