<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { Sun, Moon, SunMoon } from 'lucide-svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	type Theme = 'auto' | 'light' | 'dark';
	let theme      = $state<Theme>('auto');
	let userMenuOpen = $state(false);

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

	function closeMenu(e: MouseEvent) {
		if (!(e.target as Element).closest('.user-menu')) userMenuOpen = false;
	}

	const themeLabel: Record<Theme, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' };
</script>

<svelte:window onclick={closeMenu} />

<nav class="site-nav">
	<div class="site-nav__inner">
		<a href="/" class="site-nav__brand"><span>D-Genesis</span> Stats</a>
		<div class="site-nav__links">
			<a href="/explorers">Explorers</a>
			<a href="/characters">Characters</a>
			<a href="/orbs">Orbs</a>
			<a href="/timeline">Timeline</a>
			<a href="/bestiary">Bestiary</a>
			<a href="/dungeons">Dungeons</a>
		</div>
		<div class="site-nav__auth">
			<a class="jnc-link" href="https://j-novel.club/series?search=d-genesis" target="_blank" rel="noopener noreferrer">
				Read @ J-Novel Club ↗
			</a>

			{#if data.user}
				<div class="user-menu">
					<button class="user-menu__trigger" onclick={(e) => { e.stopPropagation(); userMenuOpen = !userMenuOpen; }}>
						{data.user.githubUsername} ▾
					</button>
					{#if userMenuOpen}
						<div class="user-menu__dropdown">
							{#if data.user.isAdmin}
								<a href="/admin" class="user-menu__item" onclick={() => userMenuOpen = false}>Admin</a>
								<div class="user-menu__divider"></div>
							{/if}
							<form method="POST" action="/auth/logout">
								<button type="submit" class="user-menu__item user-menu__item--btn">Log out</button>
							</form>
						</div>
					{/if}
				</div>
			{:else}
				<a href="/auth/login" class="btn btn--primary" style="padding: 0.3rem 0.75rem; font-size: 0.8125rem;">Log in</a>
			{/if}

			<button class="theme-btn" onclick={cycleTheme} title="Theme: {themeLabel[theme]}">
				{#if theme === 'light'}<Sun size={16} />
				{:else if theme === 'dark'}<Moon size={16} />
				{:else}<SunMoon size={16} />{/if}
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
	.jnc-link {
		font-size: 0.8125rem;
		color: var(--accent);
		text-decoration: none;
		white-space: nowrap;
		opacity: 0.85;
	}

	.jnc-link:hover { opacity: 1; text-decoration: none; }

	/* User menu */
	.user-menu { position: relative; }

	.user-menu__trigger {
		padding: 0.3rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: transparent;
		color: var(--text-2);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		transition: border-color 0.15s, color 0.15s;
	}

	.user-menu__trigger:hover { border-color: var(--accent); color: var(--text); }

	.user-menu__dropdown {
		position: absolute;
		top: calc(100% + 0.375rem);
		right: 0;
		min-width: 140px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-hover);
		z-index: 200;
		overflow: hidden;
	}

	.user-menu__item {
		display: block;
		width: 100%;
		padding: 0.6rem 1rem;
		font-size: 0.875rem;
		color: var(--text);
		text-decoration: none;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.1s;
	}

	.user-menu__item:hover { background: var(--bg-subtle); text-decoration: none; }

	.user-menu__divider {
		height: 1px;
		background: var(--border-soft);
		margin: 0;
	}

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
