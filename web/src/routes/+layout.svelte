<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<nav class="site-nav">
	<div class="site-nav__inner">
		<a href="/" class="site-nav__brand"><span>D-Genesis</span> Info</a>
		<div class="site-nav__links">
			<a href="/characters">Explorers</a>
			<a href="/wdarl">WDARL</a>
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
