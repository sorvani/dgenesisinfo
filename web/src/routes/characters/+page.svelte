<script lang="ts">
	import type { PageData } from './$types';
	import { getFullName, getNationalityFlag } from '$lib/utils';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Characters — D-Genesis Info</title></svelte:head>

<div class="container page">
	<div class="page-header">
		<h1 class="page-title">Characters</h1>
		<span class="page-count"><em>{data.characters.length} named characters</em></span>
	</div>

	{#if data.characters.length === 0}
		<p class="empty">No non-explorer characters recorded yet.</p>
	{:else}
		<div class="card-grid">
			{#each data.characters as c}
				<a href="/characters/{c.slug}" class="char-card">
					<div class="char-card__name">
						{getNationalityFlag(c.nationality)} {getFullName(c)}
					</div>
					{#if c.note}
						<p class="char-card__note">{c.note.replace(/[#*`_~]/g, '').substring(0, 80)}…</p>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.75rem;
	}

	.page-count {
		font-size: 0.875rem;
		color: var(--text-3);
	}

	.char-card {
		background: var(--bg-card);
		border: 2px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-card);
		transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, background 0.15s;
	}

	.char-card:hover {
		border-color: var(--accent);
		background: var(--accent-bg);
		box-shadow: var(--shadow-hover);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.char-card__name {
		font-weight: 700;
		font-size: 0.9375rem;
	}

	.char-card__note {
		font-size: 0.8125rem;
		color: var(--text-3);
		line-height: 1.5;
	}
</style>
