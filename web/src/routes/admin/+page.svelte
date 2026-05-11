<script lang="ts">
	import type { PageData } from './$types';
	import type { Submission } from './+page.server';

	let { data }: { data: PageData } = $props();

	function diffFields(sub: Submission): { key: string; current: unknown; proposed: unknown; changed: boolean }[] {
		const proposed = sub.proposed as Record<string, unknown>;
		const current  = sub.current  as Record<string, unknown> | null;

		if (sub.operation === 'insert') {
			return Object.entries(proposed)
				.filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
				.map(([key, val]) => ({ key, current: null, proposed: val, changed: true }));
		}

		if (sub.operation === 'update') {
			return Object.entries(proposed)
				.map(([key, val]) => ({
					key,
					current: current?.[key] ?? null,
					proposed: val,
					changed: JSON.stringify(current?.[key]) !== JSON.stringify(val),
				}))
				.filter(f => f.changed); // only show changed fields
		}

		return [];
	}

	function fmt(val: unknown): string {
		if (val === null || val === undefined) return '—';
		if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
		if (typeof val === 'object') return JSON.stringify(val);
		return String(val);
	}

	function opLabel(op: string) {
		return op === 'insert' ? 'New' : op === 'update' ? 'Edit' : 'Delete';
	}

	function opClass(op: string) {
		return op === 'insert' ? 'op op--insert' : op === 'update' ? 'op op--update' : 'op op--delete';
	}

	// Prefix field keys with entity context so a generic name like "citation"
	// makes its purpose obvious in the diff.
	function displayKey(entityType: string, key: string): string {
		if (entityType === 'character_ranking') return `ranking - ${key}`;
		if (entityType === 'character_stat')    return `stat - ${key}`;
		if (entityType === 'character_orb')     return `orb - ${key}`;
		if (entityType === 'orb_drop_rate')     return `drop rate - ${key}`;
		if (entityType === 'character' && key === 'citation') return `first known - ${key}`;
		return key;
	}
</script>

<svelte:head><title>Admin — D-Genesis Info</title></svelte:head>

<div class="container page">
	<h1 class="page-title">Admin</h1>

	{#if data.pending.length === 0}
		<p class="empty" style="margin-top: 2rem;">No pending submissions.</p>
	{:else}
		<p class="section-heading" style="margin-bottom: 1rem;">{data.pending.length} pending</p>

		{#each data.pending as s}
			<div class="sub-card card">
				<div class="sub-header">
					<div class="sub-meta">
						<span class={opClass(s.operation)}>{opLabel(s.operation)}</span>
						<strong>{s.entity_type.replace(/_/g, ' ')}</strong>
						{#if s.entity_label}<span class="sub-label">{s.entity_label}</span>{/if}
						{#if s.entity_id}<span class="sub-id">#{s.entity_id}</span>{/if}
					</div>
					<div class="sub-who">
						<span class="sub-user">@{s.github_username}</span>
						<span class="sub-date">{new Date(s.submitted_at).toLocaleDateString()}</span>
					</div>
				</div>

				{#if s.operation === 'delete'}
					<p class="delete-warn">This will permanently delete record #{s.entity_id} from {s.entity_type}.</p>
				{:else}
					{@const fields = diffFields(s)}
					{#if fields.length}
						<table class="diff-table">
							<thead>
								<tr>
									<th>Field</th>
									{#if s.operation === 'update'}<th>Current</th>{/if}
									<th>{s.operation === 'update' ? 'Proposed' : 'Value'}</th>
								</tr>
							</thead>
							<tbody>
								{#each fields as f}
									<tr class:changed={f.changed && s.operation === 'update'}>
										<td class="diff-key">{displayKey(s.entity_type, f.key)}</td>
										{#if s.operation === 'update'}
											<td class="diff-current">{fmt(f.current)}</td>
										{/if}
										<td class="diff-proposed">{fmt(f.proposed)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<p class="no-changes">No fields changed.</p>
					{/if}
				{/if}

				<div class="sub-actions">
					<form method="POST" action="?/approve">
						<input type="hidden" name="id" value={s.id} />
						<input name="admin_note" placeholder="Note (optional)" class="action-note" />
						<button type="submit" class="btn btn--primary" style="padding:0.35rem 0.875rem; font-size:0.875rem;">Approve</button>
					</form>
					<form method="POST" action="?/reject">
						<input type="hidden" name="id" value={s.id} />
						<input name="admin_note" placeholder="Reason" class="action-note" />
						<button type="submit" class="btn btn--ghost" style="padding:0.35rem 0.875rem; font-size:0.875rem; color:#dc2626; border-color:#fca5a5;">Reject</button>
					</form>
				</div>
			</div>
		{/each}
	{/if}

	{#if data.recent.length}
		<div class="data-section">
			<p class="section-heading">Recently Reviewed</p>
			<div class="card" style="padding: 0; overflow: hidden;">
				<table class="data-table">
					<thead>
						<tr><th>Op</th><th>Type</th><th>Entity</th><th>By</th><th>Status</th><th>Reviewed</th><th>Note</th></tr>
					</thead>
					<tbody>
						{#each data.recent as s}
							<tr>
								<td><span class={opClass(s.operation)}>{opLabel(s.operation)}</span></td>
								<td>{s.entity_type.replace(/_/g, ' ')}</td>
								<td style="font-weight:500;">
								{#if s.entity_url && s.entity_label}
									<a href={s.entity_url}>{s.entity_label}</a>
								{:else}
									{s.entity_label ?? '—'}
								{/if}
							</td>
								<td>@{s.github_username}</td>
								<td>
									<span class="status-badge" class:approved={s.status === 'approved'} class:rejected={s.status === 'rejected'}>
										{s.status}
									</span>
								</td>
								<td style="color:var(--text-3); font-size:0.8125rem;">{s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString() : '—'}</td>
								<td style="color:var(--text-3); font-size:0.8125rem;">{s.admin_note ?? ''}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.sub-card {
		margin-bottom: 1.25rem;
		padding: 1.25rem;
	}

	.sub-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.sub-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
	}

	.sub-id    { color: var(--text-3); font-size: 0.8125rem; font-family: var(--font-mono); }
	.sub-label { color: var(--text); font-size: 0.9375rem; font-weight: 600; }

	.sub-who {
		display: flex;
		gap: 0.75rem;
		font-size: 0.8125rem;
		color: var(--text-3);
	}

	.op {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		padding: 0.2em 0.5em;
		border-radius: 3px;
	}

	.op--insert  { background: #d1fae5; color: #065f46; }
	.op--update  { background: #dbeafe; color: #1e40af; }
	.op--delete  { background: #fee2e2; color: #991b1b; }

	.delete-warn {
		font-size: 0.9375rem;
		color: #dc2626;
		padding: 0.75rem;
		background: #fee2e2;
		border-radius: var(--radius);
		margin-bottom: 1rem;
	}

	.diff-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.diff-table th {
		text-align: left;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-3);
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.diff-table td {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--border-soft);
		vertical-align: top;
	}

	.diff-table tr:last-child td { border-bottom: none; }

	.diff-key {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-3);
		white-space: nowrap;
		width: 160px;
	}

	.diff-current { color: var(--text-3); }
	.diff-proposed { color: var(--text); font-weight: 500; }

	.changed .diff-proposed { color: var(--accent); }

	.no-changes { font-size: 0.875rem; color: var(--text-3); margin-bottom: 1rem; }

	.sub-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
		border-top: 1px solid var(--border-soft);
		padding-top: 1rem;
		margin-top: 0.5rem;
		flex-wrap: wrap;
	}

	.sub-actions form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.action-note {
		padding: 0.3rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text);
		font-size: 0.8125rem;
		width: 180px;
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.15em 0.5em;
		border-radius: 3px;
	}

	.status-badge.approved { background: #d1fae5; color: #065f46; }
	.status-badge.rejected { background: #fee2e2; color: #991b1b; }
</style>
