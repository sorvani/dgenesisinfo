<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/characters">Explorers</a>
	<a href="/wdarl">WDARL</a>
	<a href="/orbs">Orbs</a>
	<a href="/timeline">Timeline</a>
	<a href="/dungeons">Dungeons</a>
	{#if data.user}
		{#if data.user.isAdmin}<a href="/admin">Admin</a>{/if}
		<a href="/contribute">Contribute</a>
		<form method="POST" action="/auth/logout" style="display:inline">
			<button type="submit">Log out ({data.user.githubUsername})</button>
		</form>
	{:else}
		<a href="/auth/login">Log in</a>
	{/if}
</nav>

{@render children()}
