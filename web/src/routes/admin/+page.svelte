<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Admin — Pending Submissions</h1>

{#if data.pending.length === 0}
	<p>No pending submissions.</p>
{:else}
{#each data.pending as s}
	<div>
		<p>
			<strong>#{s.id}</strong> ·
			{s.operation} {s.entity_type}
			{s.entity_id != null ? `#${s.entity_id}` : '(new)'}
			· by <strong>{s.github_username}</strong>
			· {s.submitted_at}
		</p>
		<pre>{JSON.stringify(JSON.parse(s.proposed_data), null, 2)}</pre>

		<form method="POST" action="?/approve" style="display:inline">
			<input type="hidden" name="id" value={s.id} />
			<input name="admin_note" placeholder="Note (optional)" />
			<button type="submit">Approve</button>
		</form>

		<form method="POST" action="?/reject" style="display:inline">
			<input type="hidden" name="id" value={s.id} />
			<input name="admin_note" placeholder="Reason" />
			<button type="submit">Reject</button>
		</form>
	</div>
	<hr />
{/each}
{/if}

<h2>Recently Reviewed</h2>
{#each data.recent as s}
	<p>
		<strong>#{s.id}</strong> ·
		{s.operation} {s.entity_type} ·
		<span style="color:{s.status === 'approved' ? 'green' : 'red'}">{s.status}</span> ·
		{s.reviewed_at}
		{#if s.admin_note}· {s.admin_note}{/if}
	</p>
{/each}
