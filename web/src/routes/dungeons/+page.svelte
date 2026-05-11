<script lang="ts">
	import type { PageData } from './$types';
	import Flag from '$lib/Flag.svelte';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Dungeons — D-Genesis Info</title></svelte:head>

<div class="container page">
	<div class="page-header">
		<h1 class="page-title">Dungeons</h1>
		<div class="page-header-right">
			<span class="page-count"><em>{data.dungeons.length} known dungeons</em></span>
			{#if data.user}
				<a href="/contribute?type=dungeon&op=insert" class="action-add">+ Add Dungeon</a>
			{/if}
		</div>
	</div>

	<div class="card-grid">
		{#each data.dungeons as d}
			<a href="/dungeons/{d.slug}" class="dungeon-card">
				<div class="dungeon-card__top">
					{#if d.area_label || d.area != null}
						<span class="dungeon-card__area">Area {d.area_label ?? d.area}</span>
					{/if}
					{#if d.country}
						<span class="dungeon-card__nat"><Flag code={d.country} /> {d.country}</span>
					{/if}
				</div>
				<div class="dungeon-card__identity">
					<div class="dungeon-card__name">{d.name}</div>
					{#if d.region}
						<div class="dungeon-card__region">{d.region}</div>
					{/if}
				</div>
				{#if d.floors != null}
					<div class="dungeon-card__footer">{d.floors} known floors</div>
				{/if}
			</a>
		{/each}
	</div>
</div>

<style>
	.page-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.75rem;
	}
	.page-count { font-size: 0.875rem; color: var(--text-3); }

	.dungeon-card {
		background: var(--bg-card);
		border: 2px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-card);
		transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, background 0.15s;
	}

	.dungeon-card:hover {
		border-color: var(--accent);
		background: var(--accent-bg);
		box-shadow: var(--shadow-hover);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.dungeon-card__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.dungeon-card__area {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--accent);
	}

	.dungeon-card__nat {
		font-size: 0.8125rem;
		color: var(--text-3);
	}

	.dungeon-card__identity {
		border-top: 1px solid var(--border-soft);
		padding-top: 0.5rem;
	}

	.dungeon-card__name {
		font-weight: 700;
		font-size: 0.9375rem;
		color: var(--text);
	}

	.dungeon-card__region {
		font-size: 0.8125rem;
		color: var(--text-3);
		margin-top: 0.125rem;
	}

	.dungeon-card__footer {
		font-size: 0.75rem;
		color: var(--text-3);
		border-top: 1px solid var(--border-soft);
		padding-top: 0.5rem;
	}
</style>
