<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Skill Orbs — D-Genesis Info</title></svelte:head>

<div class="container page">
	<h1 class="page-title">Skill Orbs</h1>
	<p class="page-subtitle">{data.orbs.length} orbs documented</p>

	<div class="card-grid">
		{#each data.orbs as orb}
			<a href="/orbs/{orb.slug}" class="orb-card">
				<div class="orb-card__name">{orb.orb_name}</div>
				{#if orb.known_effects}
					<p class="orb-card__effects">{@html orb.known_effects.replace(/<br\s*\/?>/gi, ' ')}</p>
				{:else}
					<p class="orb-card__effects orb-card__effects--unknown">Effects unknown</p>
				{/if}
				<div class="orb-card__footer">
					<span>{orb.drop_rates.length} drop source{orb.drop_rates.length !== 1 ? 's' : ''}</span>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.orb-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-top: 3px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-card);
		transition: border-color 0.15s, border-top-color 0.15s, box-shadow 0.15s, transform 0.15s;
	}

	.orb-card:hover {
		border-top-color: var(--accent);
		border-color: var(--border);
		box-shadow: var(--shadow-hover);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.orb-card__name {
		font-weight: 700;
		font-size: 0.9375rem;
		color: var(--text);
	}

	.orb-card__effects {
		font-size: 0.8125rem;
		color: var(--text-2);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		flex: 1;
	}

	.orb-card__effects--unknown {
		color: var(--text-3);
		font-style: italic;
	}

	.orb-card__footer {
		font-size: 0.75rem;
		color: var(--text-3);
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-soft);
		margin-top: auto;
	}
</style>
