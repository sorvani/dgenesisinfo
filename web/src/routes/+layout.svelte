<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { Sun, Moon, SunMoon } from 'lucide-svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	type Theme = 'auto' | 'light' | 'dark';
	let theme      = $state<Theme>('auto');
	let userMenuOpen = $state(false);
	let mobileMenuOpen = $state(false);

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
		if (!(e.target as Element).closest('.site-nav')) mobileMenuOpen = false;
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
						{data.user.githubUsername}
						{#if data.pendingCount > 0}<span class="pending-badge">{data.pendingCount}</span>{/if}
						▾
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
				<a href="/auth/login" class="btn btn--primary btn--auth" style="padding: 0.3rem 0.75rem; font-size: 0.8125rem;">Log in with GitHub</a>
			{/if}

			<button class="theme-btn" onclick={cycleTheme} title="Theme: {themeLabel[theme]}">
				{#if theme === 'light'}<Sun size={16} />
				{:else if theme === 'dark'}<Moon size={16} />
				{:else}<SunMoon size={16} />{/if}
			</button>
		</div>

		<button class="hamburger" aria-label="Menu" onclick={(e) => { e.stopPropagation(); mobileMenuOpen = !mobileMenuOpen; }}>
			<span class:open={mobileMenuOpen}></span>
			{#if data.pendingCount > 0 && !mobileMenuOpen}<span class="pending-badge hamburger-badge">{data.pendingCount}</span>{/if}
		</button>
	</div>

	{#if mobileMenuOpen}
		<div class="mobile-menu">
			<a href="/explorers" onclick={() => mobileMenuOpen = false}>Explorers</a>
			<a href="/characters" onclick={() => mobileMenuOpen = false}>Characters</a>
			<a href="/orbs" onclick={() => mobileMenuOpen = false}>Orbs</a>
			<a href="/timeline" onclick={() => mobileMenuOpen = false}>Timeline</a>
			<a href="/bestiary" onclick={() => mobileMenuOpen = false}>Bestiary</a>
			<a href="/dungeons" onclick={() => mobileMenuOpen = false}>Dungeons</a>
			<div class="mobile-menu__divider"></div>
			<a class="mobile-menu__jnc" href="https://j-novel.club/series?search=d-genesis" target="_blank" rel="noopener noreferrer" onclick={() => mobileMenuOpen = false}>Read @ J-Novel Club ↗</a>
			{#if data.user}
				<form method="POST" action="/auth/logout">
					<button type="submit" class="mobile-menu__btn">Log out ({data.user.githubUsername})</button>
				</form>
			{:else}
				<a href="/auth/login" onclick={() => mobileMenuOpen = false}>Log in with GitHub</a>
			{/if}
			<div class="mobile-menu__divider"></div>
			<button class="mobile-menu__btn mobile-menu__theme" onclick={cycleTheme}>
				{#if theme === 'light'}<Sun size={15} /> Light mode{:else if theme === 'dark'}<Moon size={15} /> Dark mode{:else}<SunMoon size={15} /> Auto mode{/if}
			</button>
		</div>
	{/if}
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

	.pending-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: 9px;
		background: var(--accent);
		color: #fff;
		font-size: 0.6875rem;
		font-weight: 700;
		line-height: 1;
		margin: 0 0.2rem;
	}

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

	/* ── Hamburger ── */
	.hamburger { position: relative; }
	.hamburger-badge { position: absolute; top: -6px; right: -6px; margin: 0; }

	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 36px;
		height: 36px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		margin-left: 0.5rem;
		flex-shrink: 0;
	}

	.hamburger span,
	.hamburger span::before,
	.hamburger span::after {
		display: block;
		width: 22px;
		height: 2px;
		background: var(--text);
		border-radius: 2px;
		transition: transform 0.2s, opacity 0.2s;
		position: relative;
	}

	.hamburger span::before,
	.hamburger span::after {
		content: '';
		position: absolute;
		left: 0;
	}

	.hamburger span::before { top: -7px; }
	.hamburger span::after  { top: 7px; }

	.hamburger span.open { background: transparent; }
	.hamburger span.open::before { transform: translateY(7px) rotate(45deg); }
	.hamburger span.open::after  { transform: translateY(-7px) rotate(-45deg); }

	/* ── Mobile menu ── */
	.mobile-menu {
		display: none;
		flex-direction: column;
		background: var(--bg-card);
		border-top: 1px solid var(--border);
		padding: 0.5rem 0;
	}

	.mobile-menu a,
	.mobile-menu__btn {
		display: block;
		padding: 0.75rem 1.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--text-2);
		text-decoration: none;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: color 0.15s, background 0.15s;
	}

	.mobile-menu a:hover,
	.mobile-menu__btn:hover {
		color: var(--accent);
		background: var(--bg-subtle);
	}

	.mobile-menu__divider {
		height: 1px;
		background: var(--border-soft);
		margin: 0.375rem 0;
	}

	.mobile-menu__jnc { color: var(--accent) !important; font-size: 0.875rem !important; }
	.mobile-menu__theme { display: flex; align-items: center; gap: 0.5rem; color: var(--text-3) !important; font-size: 0.875rem !important; }

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.site-nav__links { display: none; }
		.site-nav__auth .jnc-link,
		.site-nav__auth .btn--auth,
		.site-nav__auth .user-menu,
		.site-nav__auth .theme-btn { display: none; }
		.hamburger { display: flex; }
		.mobile-menu { display: flex; }
	}
</style>
