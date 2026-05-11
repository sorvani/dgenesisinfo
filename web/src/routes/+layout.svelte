<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { Sun, Moon, SunMoon } from 'lucide-svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	type Theme = 'auto' | 'light' | 'dark';
	let theme = $state<Theme>('auto');

	onMount(() => {
		theme = (localStorage.getItem('theme') as Theme) || 'auto';
	});

	function cycleTheme() {
		const next: Theme = theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto';
		theme = next;
		localStorage.setItem('theme', next);
		if (next === 'auto') {
			document.documentElement.removeAttribute('data-theme');
		} else {
			document.documentElement.setAttribute('data-theme', next);
		}
	}

	const themeLabel: Record<Theme, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' };
</script>

<nav class="site-nav">
	<div class="site-nav__inner">
		<a href="/" class="site-nav__brand"><span>D-Genesis</span> Info</a>
		<div class="site-nav__links">
			<a href="/explorers">Explorers</a>
			<a href="/characters">Characters</a>
			<a href="/orbs">Orbs</a>
			<a href="/timeline">Timeline</a>
			<a href="/dungeons">Dungeons</a>
		</div>
		<div class="site-nav__auth">
			{#if data.user}
				{#if data.user.isAdmin}
					<a href="/admin" class="btn btn--ghost" style="padding: 0.3rem 0.75rem; font-size: 0.8125rem;">Admin</a>
				{/if}
				<a href="/contribute" class="btn btn--ghost" style="padding: 0.3rem 0.75rem; font-size: 0.8125rem;">Contribute</a>
				<form method="POST" action="/auth/logout">
					<button type="submit" class="btn btn--ghost" style="padding: 0.3rem 0.75rem; font-size: 0.8125rem;">
						{data.user.githubUsername} · Log out
					</button>
				</form>
			{:else}
				<a href="/auth/login" class="btn btn--primary" style="padding: 0.3rem 0.75rem; font-size: 0.8125rem;">Log in with GitHub</a>
			{/if}
			<button class="theme-btn" onclick={cycleTheme} title="Theme: {themeLabel[theme]}">
				{#if theme === 'light'}
					<Sun size={16} />
				{:else if theme === 'dark'}
					<Moon size={16} />
				{:else}
					<SunMoon size={16} />
				{/if}
			</button>
		</div>
	</div>
</nav>

<main>
	{@render children()}
</main>

<footer class="site-footer">
	<div class="site-footer__inner">
		Design &copy; {new Date().getFullYear()} J. Busch | All source data copyright of the original rights holders
		<a href="/credits">listed here</a>.
	</div>
</footer>

<style>
	.theme-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-subtle);
		color: var(--text-2);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
		flex-shrink: 0;
	}

	.theme-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
