<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { showToast } from '$lib/toast';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const TIMEZONES = ['JST','EST','CST','MST','PST','UTC','GMT','CET','EET','IST','KST'];
	const SCAN_TYPES = ['Making','Appraisal','Stat Measuring Device'];
	const CATEGORIES = ['Humanoid','Beast','Undead','Demon','Aberration','Aquatic','Elemental','Ooze','Unknown'];

	let entityType = $state(data.defaultType);
	let operation  = $state(data.defaultOp);
	let entityId   = $state<number | null>(data.defaultEntityId);

	let redirecting = false;
	$effect(() => {
		if (form?.success && !redirecting) {
			redirecting = true;
			showToast('Submission received — thank you!');
			if (window.history.length > 1) history.back();
			else window.location.href = '/';
		}
	});

	let deleteDialog: HTMLDialogElement;
	let deleteForm: HTMLFormElement;
	function openDeleteConfirm() { deleteDialog?.showModal(); }
	function cancelDelete() { deleteDialog?.close(); }
	function confirmDelete() {
		deleteDialog?.close();
		deleteForm?.requestSubmit();
	}

	// ── Character fields ──────────────────────────────────────────────────────
	let c_firstName      = $state('');
	let c_lastName       = $state('');
	let c_monikers       = $state<string[]>([]);
	let c_nationality    = $state('');
	let c_sex            = $state('');
	let c_birthday       = $state('');
	let c_dateFirstKnown = $state('');
	let c_area           = $state<number | null>(null);
	let c_note         = $state('');
	let c_tags         = $state<string[]>([]);
	let c_monikerInput   = $state('');
	let c_monikerAdding  = $state(false);
	let c_tagInput       = $state('');
	let c_tagAdding      = $state(false);
	let c_isExplorer     = $state(true);
	let c_inWdarl     = $state(false);
	let c_isPublic    = $state(true);

	// ── Orb fields ────────────────────────────────────────────────────────────
	let o_name    = $state('');
	let o_effects = $state('');
	let o_note    = $state('');

	// ── Dungeon fields ────────────────────────────────────────────────────────
	let d_name      = $state('');
	let d_area      = $state<number | null>(null);
	let d_areaLabel = $state('');
	let d_country   = $state('');
	let d_region    = $state('');
	let d_floors    = $state<number | null>(null);
	let d_isActive  = $state(true);
	let d_note      = $state('');

	// ── Monster fields ────────────────────────────────────────────────────────
	let m_name     = $state('');
	let m_category = $state('Unknown');
	let m_note     = $state('');

	// ── Timeline event fields ─────────────────────────────────────────────────
	let t_dateLocal   = $state('');
	let t_time        = $state('');
	let t_timezone    = $state('JST');
	let t_dateLabel   = $state('');
	let t_displayTime = $state(false);
	let t_preHistory  = $state(false);
	let t_event       = $state('');

	// ── Character stat fields ─────────────────────────────────────────────────
	let cs_charId      = $state<number | null>(data.defaultCharId);
	let cs_dateNoted   = $state('');
	let cs_dateSeq     = $state(1);
	let cs_scanType    = $state('Making');
	let cs_str = $state<number|null>(null), cs_vit = $state<number|null>(null);
	let cs_int = $state<number|null>(null), cs_agi = $state<number|null>(null);
	let cs_dex = $state<number|null>(null), cs_luc = $state<number|null>(null);
	let cs_hp  = $state<number|null>(null), cs_mp  = $state<number|null>(null);
	let cs_sp  = $state<number|null>(null);
	let cs_total = $state<number|null>(null), cs_pts = $state<number|null>(null);

	// ── Character ranking fields ──────────────────────────────────────────────
	let cr_charId    = $state<number | null>(data.defaultCharId);
	let cr_rank      = $state<number | null>(null);
	let cr_above     = $state<number | null>(null);
	let cr_dateNoted = $state('');

	// ── Character orb fields ──────────────────────────────────────────────────
	let co_charId       = $state<number | null>(data.defaultCharId);
	let co_orbId        = $state<number | null>(null);
	let co_dateAcquired = $state('');
	let co_dateNote     = $state('');

	// ── Orb drop rate fields ──────────────────────────────────────────────────
	let dr_orbId     = $state<number | null>(data.defaultOrbId);
	let dr_monsterId = $state<number | null>(data.defaultMonsterId);
	let dr_creature  = $state('');
	let dr_dungeon   = $state('');
	let dr_floor     = $state('');
	let dr_favOut    = $state<number | null>(null);
	let dr_total     = $state<number | null>(null);

	// ── Monster ↔ dungeon fields ──────────────────────────────────────────────
	let md_monsterId = $state<number | null>(data.defaultMonsterId);
	let md_dungeonId = $state<number | null>(data.defaultDungeonId);
	let md_floor     = $state('');

	// ── Shared citation ───────────────────────────────────────────────────────
	let cite_vol         = $state('');
	let cite_ch          = $state('');
	let cite_part        = $state('');
	let cite_source_type = $state<string | null>(null);

	// Pre-fill from server data when editing
	$effect(() => {
		if (operation !== 'update' || !entityId) return;
		if (entityType === 'character') {
			const c = data.characters.find(c => c.id === entityId);
			if (!c) return;
			c_firstName = c.first_name ?? '';
			c_lastName  = c.last_name ?? '';
			c_monikers  = [...(c.monikers ?? [])];
			c_nationality    = c.nationality ?? '';
			c_sex            = c.sex ?? '';
			c_birthday       = c.birthday ?? '';
			c_dateFirstKnown = c.date_first_known ?? '';
			c_area           = c.area;
			c_note      = c.note ?? '';
			c_tags      = [...(c.tags ?? [])];
			c_isExplorer = c.is_explorer === 1;
			c_inWdarl   = c.in_wdarl === 1;
			c_isPublic  = c.is_public === 1;
			cite_vol         = c.cite_first_known?.volume   ?? '';
			cite_ch          = c.cite_first_known?.chapter  ?? '';
			cite_part        = c.cite_first_known?.jnc_part ?? '';
			cite_source_type = c.cite_first_known?.source_type ?? null;
		} else if (entityType === 'orb') {
			const o = data.orbs.find(o => o.id === entityId);
			if (!o) return;
			o_name    = o.orb_name;
			o_effects = o.known_effects ?? '';
			o_note    = o.note ?? '';
		} else if (entityType === 'dungeon') {
			const d = data.dungeons.find(d => d.id === entityId);
			if (!d) return;
			d_name      = d.name;
			d_area      = d.area;
			d_areaLabel = d.area_label ?? '';
			d_country   = d.country ?? '';
			d_region    = d.region ?? '';
			d_floors    = d.floors;
			d_isActive  = d.is_active === 1;
			d_note      = d.note ?? '';
			cite_vol         = d.citation?.volume   ?? '';
			cite_ch          = d.citation?.chapter  ?? '';
			cite_part        = d.citation?.jnc_part ?? '';
			cite_source_type = d.citation?.source_type ?? null;
		} else if (entityType === 'monster') {
			const m = data.monsters.find(m => m.id === entityId);
			if (!m) return;
			m_name     = m.name;
			m_category = m.category ?? 'Unknown';
			m_note     = m.note ?? '';
			cite_vol         = m.citation?.volume   ?? '';
			cite_ch          = m.citation?.chapter  ?? '';
			cite_part        = m.citation?.jnc_part ?? '';
			cite_source_type = m.citation?.source_type ?? null;
		} else if (entityType === 'character_ranking' && data.prefillRow) {
			const r = data.prefillRow as Record<string, any>;
			cr_charId    = r.character_id;
			cr_rank      = r.rank;
			cr_above     = r.known_above_rank;
			cr_dateNoted = r.date_noted ?? '';
			cite_vol         = r.cite_volume   ?? '';
			cite_ch          = r.cite_chapter  ?? '';
			cite_part        = r.cite_jnc_part ?? '';
			cite_source_type = r.cite_source_type ?? null;
		} else if (entityType === 'character_stat' && data.prefillRow) {
			const s = data.prefillRow as Record<string, any>;
			cs_charId    = s.character_id;
			cs_dateNoted = s.date_noted ?? '';
			cs_dateSeq   = s.date_sequence ?? 1;
			cs_scanType  = s.scan_type ?? 'Making';
			cs_str = s.str; cs_vit = s.vit; cs_int = s.int; cs_agi = s.agi;
			cs_dex = s.dex; cs_luc = s.luc;
			cs_hp = s.hp; cs_mp = s.mp; cs_sp = s.sp;
			cs_total = s.stat_total; cs_pts = s.points_from_avg;
			cite_vol         = s.cite_volume   ?? '';
			cite_ch          = s.cite_chapter  ?? '';
			cite_part        = s.cite_jnc_part ?? '';
			cite_source_type = s.cite_source_type ?? null;
		} else if (entityType === 'character_orb' && data.prefillRow) {
			const o = data.prefillRow as Record<string, any>;
			co_charId       = o.character_id;
			co_orbId        = o.orb_id;
			co_dateAcquired = o.date_acquired ?? '';
			co_dateNote     = o.date_note ?? '';
			cite_vol         = o.cite_volume   ?? '';
			cite_ch          = o.cite_chapter  ?? '';
			cite_part        = o.cite_jnc_part ?? '';
			cite_source_type = o.cite_source_type ?? null;
		} else if (entityType === 'orb_drop_rate' && data.prefillRow) {
			const r = data.prefillRow as Record<string, any>;
			dr_orbId     = r.orb_id;
			dr_monsterId = r.monster_id;
			dr_creature  = r.creature ?? '';
			dr_dungeon   = r.dungeon  ?? '';
			dr_floor     = r.floor    ?? '';
			dr_favOut    = r.favorable_outcomes;
			dr_total     = r.total_events;
			cite_vol         = r.cite_volume   ?? '';
			cite_ch          = r.cite_chapter  ?? '';
			cite_part        = r.cite_jnc_part ?? '';
			cite_source_type = r.cite_source_type ?? null;
		} else if (entityType === 'monster_dungeon' && data.prefillRow) {
			const r = data.prefillRow as Record<string, any>;
			md_monsterId = r.monster_id;
			md_dungeonId = r.dungeon_id;
			md_floor     = r.floor ?? '';
			cite_vol         = r.cite_volume   ?? '';
			cite_ch          = r.cite_chapter  ?? '';
			cite_part        = r.cite_jnc_part ?? '';
			cite_source_type = r.cite_source_type ?? null;
		} else if (entityType === 'timeline_event' && data.prefillRow) {
			const e = data.prefillRow as Record<string, any>;
			if (e.date_utc) {
				// stored as ISO UTC; the form's submit logic interprets the date+time inputs
				// as local time, so the inverse here is to read local components from the Date.
				const d = new Date(e.date_utc);
				const pad = (n: number) => n.toString().padStart(2, '0');
				t_dateLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
				if (e.display_time) {
					t_time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
				}
			}
			t_timezone    = e.timezone ?? 'JST';
			t_dateLabel   = e.date_label ?? '';
			t_displayTime = e.display_time === 1;
			t_preHistory  = e.pre_history  === 1;
			t_event       = e.event ?? '';
			cite_vol         = e.cite_volume   ?? '';
			cite_ch          = e.cite_chapter  ?? '';
			cite_part        = e.cite_jnc_part ?? '';
			cite_source_type = e.cite_source_type ?? null;
		}
	});

	function addMonikerChip() {
		const v = c_monikerInput.trim();
		if (v) c_monikers = [...c_monikers, v];
		c_monikerInput = '';
		c_monikerAdding = false;
	}
	function removeMoniker(i: number) { c_monikers = c_monikers.filter((_, idx) => idx !== i); }
	function addTagChip() {
		const v = c_tagInput.trim();
		if (v) c_tags = [...c_tags, v];
		c_tagInput = '';
		c_tagAdding = false;
	}
	function removeTag(i: number) { c_tags = c_tags.filter((_, idx) => idx !== i); }

	// All distinct tags/monikers used anywhere in the character set, sorted.
	const allTags = $derived.by(() => {
		const s = new Set<string>();
		for (const c of data.characters) for (const t of c.tags ?? []) s.add(t);
		return [...s].sort((a, b) => a.localeCompare(b));
	});
	const allMonikers = $derived.by(() => {
		const s = new Set<string>();
		for (const c of data.characters) for (const m of c.monikers ?? []) s.add(m);
		return [...s].sort((a, b) => a.localeCompare(b));
	});

	function suggest(all: string[], query: string, used: string[]): string[] {
		const q = query.trim().toLowerCase();
		const usedSet = new Set(used);
		const matches = all.filter(t => !usedSet.has(t) && (q === '' || t.toLowerCase().includes(q)));
		return matches.slice(0, 8);
	}

	function pickSuggestion(value: string, kind: 'tag' | 'moniker') {
		if (kind === 'tag') {
			c_tagInput = value;
			addTagChip();
		} else {
			c_monikerInput = value;
			addMonikerChip();
		}
	}

	// Live thousands-separator formatting for the drop-rate inputs.
	function formatThousands(n: number | null): string {
		return (n === null || n === undefined) ? '' : n.toLocaleString('en-US');
	}

	function handleCommaInput(e: Event, setter: (v: number | null) => void) {
		const target = e.currentTarget as HTMLInputElement;
		const oldVal = target.value;
		const cursor = target.selectionStart ?? oldVal.length;
		const digitsBefore = oldVal.slice(0, cursor).replace(/[^\d]/g, '').length;

		const clean = oldVal.replace(/[^\d]/g, '');
		const raw = clean === '' ? null : parseInt(clean, 10);
		setter(raw);

		const formatted = formatThousands(raw);
		target.value = formatted;

		// Restore cursor at the same digit-position in the newly formatted string.
		let newCursor = formatted.length;
		let count = 0;
		for (let i = 0; i < formatted.length; i++) {
			if (/\d/.test(formatted[i])) {
				count++;
				if (count > digitsBefore) { newCursor = i; break; }
			}
		}
		target.setSelectionRange(newCursor, newCursor);
	}

	function buildProposedData(): string {
		const cite = { volume: cite_vol || null, chapter: cite_ch || null, jnc_part: cite_part || null, source_type: cite_source_type || null };

		if (entityType === 'character') return JSON.stringify({
			first_name: c_firstName || null, last_name: c_lastName || null,
			monikers: c_monikers.filter(Boolean),
			nationality: c_nationality || null, sex: c_sex || null,
			birthday: c_birthday || null, date_first_known: c_dateFirstKnown || null,
			area: c_area,
			is_explorer: c_isExplorer ? 1 : 0, in_wdarl: c_inWdarl ? 1 : 0, is_public: c_isPublic ? 1 : 0,
			note: c_note || null, tags: c_tags.filter(Boolean), citation: cite,
		}, null, 2);

		if (entityType === 'orb') return JSON.stringify({
			orb_name: o_name, known_effects: o_effects || null, note: o_note || null,
		}, null, 2);

		if (entityType === 'dungeon') return JSON.stringify({
			name: d_name, area: d_area, area_label: d_areaLabel || null,
			country: d_country || null, region: d_region || null,
			floors: d_floors, is_active: d_isActive ? 1 : 0,
			note: d_note || null, citation: cite,
		}, null, 2);

		if (entityType === 'monster') return JSON.stringify({
			name: m_name, category: m_category, note: m_note || null, citation: cite,
		}, null, 2);

		if (entityType === 'timeline_event') {
			let dateUtc = t_dateLocal;
			if (t_dateLocal && t_time) dateUtc = new Date(`${t_dateLocal}T${t_time}`).toISOString();
			else if (t_dateLocal) dateUtc = new Date(t_dateLocal).toISOString();
			return JSON.stringify({
				date_utc: dateUtc, date_label: t_dateLabel || null,
				display_time: t_displayTime ? 1 : 0, timezone: t_timezone,
				pre_history: t_preHistory ? 1 : 0, event: t_event, citation: cite,
			}, null, 2);
		}

		if (entityType === 'character_stat') return JSON.stringify({
			character_id: cs_charId, date_noted: cs_dateNoted || null,
			date_sequence: cs_dateSeq, scan_type: cs_scanType,
			str: cs_str, vit: cs_vit, int: cs_int, agi: cs_agi, dex: cs_dex, luc: cs_luc,
			hp: cs_hp, mp: cs_mp, sp: cs_sp, stat_total: cs_total, points_from_avg: cs_pts,
			citation: cite,
		}, null, 2);

		if (entityType === 'character_ranking') return JSON.stringify({
			character_id: cr_charId, rank: cr_rank, known_above_rank: cr_above,
			date_noted: cr_dateNoted || null, citation: cite,
		}, null, 2);

		if (entityType === 'character_orb') return JSON.stringify({
			character_id: co_charId, orb_id: co_orbId,
			date_acquired: co_dateAcquired || null, date_note: co_dateNote || null, citation: cite,
		}, null, 2);

		if (entityType === 'orb_drop_rate') {
			// Keep the legacy free-text 'creature' in sync with the selected monster's
			// name so the admin diff doesn't look like data loss when a monster is picked.
			const monsterName = dr_monsterId
				? (data.monsters.find(m => m.id === dr_monsterId)?.name ?? null)
				: null;
			return JSON.stringify({
				orb_id: dr_orbId, monster_id: dr_monsterId,
				creature: monsterName ?? (dr_creature || null),
				dungeon: dr_dungeon || null,
				floor: dr_floor || null, favorable_outcomes: dr_favOut, total_events: dr_total, citation: cite,
			}, null, 2);
		}

		if (entityType === 'monster_dungeon') return JSON.stringify({
			monster_id: md_monsterId, dungeon_id: md_dungeonId,
			floor: md_floor || null, citation: cite,
		}, null, 2);

		return '{}';
	}

</script>

<svelte:head><title>Contribute — D-Genesis Info</title></svelte:head>

<div class="form-bar">
	<div class="container form-bar__inner">
		<div class="form-bar__title">
			<span>Submit a Contribution</span>
			<span class="form-bar__sub">Reviewed by an admin before being applied</span>
		</div>
		<div class="form-bar__actions">
			{#if form?.error}<span class="form-bar__err">{form.error}</span>{/if}
			{#if operation !== 'delete'}
				<button type="submit" form="contribute-form" class="btn btn--primary">Submit for review</button>
			{/if}
			{#if entityId && operation !== 'delete'}
				<button type="button" class="btn btn--danger" onclick={openDeleteConfirm}>Delete</button>
				<form
					bind:this={deleteForm}
					method="POST"
					action="?/submit"
					use:enhance={() => async ({ update }) => { await update({ reset: false }); }}
					style="display:none"
				>
					<input type="hidden" name="entity_type"   value={entityType} />
					<input type="hidden" name="operation"     value="delete" />
					<input type="hidden" name="entity_id"     value={entityId} />
					<input type="hidden" name="proposed_data" value={'{}'} />
				</form>
			{/if}
			{#if operation === 'delete'}
				<button type="submit" form="contribute-form" class="btn btn--danger">Submit deletion</button>
			{/if}
			<button type="button" class="btn btn--ghost" onclick={() => history.back()}>Cancel</button>
		</div>
	</div>
</div>

<div class="contribute-body">
	<div class="container">
	<form id="contribute-form" method="POST" action="?/submit"
		use:enhance={({ formData }) => {
			formData.set('proposed_data', buildProposedData());
			return async ({ update }) => {
				await update({ reset: false });
			};
		}}>
		<input type="hidden" name="entity_type" value={entityType} />
		<input type="hidden" name="operation"   value={operation} />
		<input type="hidden" name="entity_id"   value={entityId ?? ''} />
		<input type="hidden" name="proposed_data" value="" />

		{#if operation === 'delete'}
		<div class="card form-section delete-confirm">
			<p class="delete-confirm__title">⚠ Confirm deletion</p>
			<p class="delete-confirm__body">
				You're about to submit a deletion request for record <code>#{entityId}</code>
				({entityType.replace(/_/g, ' ')}). Click <strong>Submit deletion</strong> above
				and an admin will review before the record is removed.
			</p>
		</div>
		{/if}

		{#if operation !== 'delete'}
		<!-- ── Character / Explorer ── -->
		{#if entityType === 'character'}
		<div class="card form-section">
			<p class="section-heading">Identity</p>
			<div class="field-grid">
				<div class="field">
					<label class="field-label">First Name</label>
					<input type="text" bind:value={c_firstName} />
				</div>
				<div class="field">
					<label class="field-label">Last Name</label>
					<input type="text" bind:value={c_lastName} />
				</div>
				<div class="field">
					<label class="field-label">Nationality <span class="hint">2-letter code</span></label>
					<input type="text" maxlength="2" bind:value={c_nationality} style="text-transform:uppercase" />
				</div>
				<div class="field">
					<label class="field-label">Sex</label>
					<select bind:value={c_sex}>
						<option value="">—</option>
						<option>Male</option>
						<option>Female</option>
					</select>
				</div>
				<div class="field">
					<label class="field-label">Birthday</label>
					<input type="text" placeholder="e.g. August 10" bind:value={c_birthday} />
				</div>
				<div class="field">
					<label class="field-label">First Known <span class="hint">YYYY-MM-DD</span></label>
					<input type="date" bind:value={c_dateFirstKnown} />
				</div>
				<div class="field">
					<label class="field-label">D-Card Area</label>
					<input type="number" bind:value={c_area} />
				</div>
			</div>

			<div class="field mt">
				<label class="field-label">Monikers
					{#if !c_monikerAdding}<button type="button" class="array-add" onclick={() => c_monikerAdding = true}>+ Add</button>{/if}
				</label>
				<div class="chip-row">
					{#each c_monikers as m, i}
						<span class="chip">{m}<button type="button" class="chip-remove" onclick={() => removeMoniker(i)}>✕</button></span>
					{/each}
					{#if c_monikerAdding}
						{@const monikerSuggestions = suggest(allMonikers, c_monikerInput, c_monikers)}
						<span class="chip-input-wrap">
							<input class="chip-input-inline" type="text" bind:value={c_monikerInput}
								placeholder="moniker…" autofocus
								onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMonikerChip(); } if (e.key === 'Escape') { c_monikerInput = ''; c_monikerAdding = false; } }}
								onblur={() => addMonikerChip()} />
							{#if monikerSuggestions.length}
								<div class="chip-suggestions">
									{#each monikerSuggestions as s}
										<button type="button" class="chip-suggestion"
											onmousedown={(e) => { e.preventDefault(); pickSuggestion(s, 'moniker'); }}>{s}</button>
									{/each}
								</div>
							{/if}
						</span>
					{/if}
				</div>
			</div>

			<div class="field mt">
				<label class="field-label">Tags
					{#if !c_tagAdding}<button type="button" class="array-add" onclick={() => c_tagAdding = true}>+ Add</button>{/if}
				</label>
				<div class="chip-row">
					{#each c_tags as t, i}
						<span class="chip">{t}<button type="button" class="chip-remove" onclick={() => removeTag(i)}>✕</button></span>
					{/each}
					{#if c_tagAdding}
						{@const tagSuggestions = suggest(allTags, c_tagInput, c_tags)}
						<span class="chip-input-wrap">
							<input class="chip-input-inline" type="text" bind:value={c_tagInput}
								placeholder="tag…" autofocus
								onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagChip(); } if (e.key === 'Escape') { c_tagInput = ''; c_tagAdding = false; } }}
								onblur={() => addTagChip()} />
							{#if tagSuggestions.length}
								<div class="chip-suggestions">
									{#each tagSuggestions as s}
										<button type="button" class="chip-suggestion"
											onmousedown={(e) => { e.preventDefault(); pickSuggestion(s, 'tag'); }}>{s}</button>
									{/each}
								</div>
							{/if}
						</span>
					{/if}
				</div>
			</div>

			<div class="field mt">
				<label class="field-label">Note <span class="hint">Markdown supported</span></label>
				<textarea rows="4" bind:value={c_note}></textarea>
			</div>

			<div class="check-row mt">
				<label class="toggle-label"><input type="checkbox" bind:checked={c_isExplorer} /><span class="toggle-track"></span> Is Explorer</label>
				<label class="toggle-label"><input type="checkbox" bind:checked={c_inWdarl} /><span class="toggle-track"></span> In WDARL</label>
				<label class="toggle-label"><input type="checkbox" bind:checked={c_isPublic} /><span class="toggle-track"></span> Public on WDARL</label>
			</div>
		</div>
		{/if}

		<!-- ── Orb ── -->
		{#if entityType === 'orb'}
		<div class="card form-section">
			<div class="field">
				<label class="field-label">Orb Name</label>
				<input type="text" bind:value={o_name} />
			</div>
			<div class="field mt">
				<label class="field-label">Known Effects <span class="hint">Markdown supported</span></label>
				<textarea rows="4" bind:value={o_effects}></textarea>
			</div>
			<div class="field mt">
				<label class="field-label">Notes <span class="hint">Markdown supported</span></label>
				<textarea rows="3" bind:value={o_note}></textarea>
			</div>
		</div>
		{/if}

		<!-- ── Dungeon ── -->
		{#if entityType === 'dungeon'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Name</label>
					<input type="text" bind:value={d_name} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Area #</label>
					<input type="number" bind:value={d_area} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Area Label <span class="hint">e.g. All</span></label>
					<input type="text" bind:value={d_areaLabel} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Country <span class="hint">2-letter</span></label>
					<input type="text" maxlength="2" bind:value={d_country} style="text-transform:uppercase" />
				</div>
				<div class="field">
					<label class="field-label">Region / City</label>
					<input type="text" bind:value={d_region} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Known Floors</label>
					<input type="number" bind:value={d_floors} />
				</div>
			</div>
			<div class="field mt">
				<label class="field-label">Notes <span class="hint">Markdown supported</span></label>
				<textarea rows="4" bind:value={d_note}></textarea>
			</div>
			<div class="check-row mt">
				<label class="toggle-label"><input type="checkbox" bind:checked={d_isActive} /><span class="toggle-track"></span> Active dungeon</label>
			</div>
		</div>
		{/if}

		<!-- ── Monster ── -->
		{#if entityType === 'monster'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Name</label>
					<input type="text" bind:value={m_name} />
				</div>
				<div class="field">
					<label class="field-label">Category</label>
					<select bind:value={m_category}>
						{#each CATEGORIES as cat}<option>{cat}</option>{/each}
					</select>
				</div>
			</div>
			<div class="field mt">
				<label class="field-label">Notes <span class="hint">Markdown supported</span></label>
				<textarea rows="3" bind:value={m_note}></textarea>
			</div>
		</div>
		{/if}

		<!-- ── Timeline event ── -->
		{#if entityType === 'timeline_event'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Date</label>
					<input type="date" bind:value={t_dateLocal} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Time <span class="hint">optional</span></label>
					<input type="time" bind:value={t_time} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Timezone</label>
					<select bind:value={t_timezone}>
						{#each TIMEZONES as tz}<option>{tz}</option>{/each}
					</select>
				</div>
				<div class="field">
					<label class="field-label">Date Label <span class="hint">display override</span></label>
					<input type="text" placeholder="e.g. Early Summer 2015" bind:value={t_dateLabel} />
				</div>
			</div>
			<div class="field mt">
				<label class="field-label">Event <span class="hint">Markdown supported</span></label>
				<textarea rows="4" bind:value={t_event}></textarea>
			</div>
			<div class="check-row mt">
				<label class="toggle-label"><input type="checkbox" bind:checked={t_displayTime} /><span class="toggle-track"></span> Show time in display</label>
				<label class="toggle-label"><input type="checkbox" bind:checked={t_preHistory} /><span class="toggle-track"></span> Pre-History event</label>
			</div>
		</div>
		{/if}

		<!-- ── Character stat ── -->
		{#if entityType === 'character_stat'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Character</label>
					<select bind:value={cs_charId}>
						<option value={null}>— select —</option>
						{#each data.characters as c}<option value={c.id}>{c.first_name} {c.last_name}</option>{/each}
					</select>
				</div>
				<div class="field field--sm">
					<label class="field-label">Date</label>
					<input type="date" bind:value={cs_dateNoted} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Sequence</label>
					<input type="number" min="1" bind:value={cs_dateSeq} />
				</div>
				<div class="field">
					<label class="field-label">Scan Type</label>
					<select bind:value={cs_scanType}>
						{#each SCAN_TYPES as t}<option>{t}</option>{/each}
					</select>
				</div>
			</div>
			<p class="field-label mt">Combat Stats</p>
			<div class="stat-grid">
				<div class="field"><label class="field-label">STR</label><input type="number" bind:value={cs_str} /></div>
				<div class="field"><label class="field-label">VIT</label><input type="number" bind:value={cs_vit} /></div>
				<div class="field"><label class="field-label">INT</label><input type="number" bind:value={cs_int} /></div>
				<div class="field"><label class="field-label">AGI</label><input type="number" bind:value={cs_agi} /></div>
				<div class="field"><label class="field-label">DEX</label><input type="number" bind:value={cs_dex} /></div>
				<div class="field"><label class="field-label">LUC</label><input type="number" bind:value={cs_luc} /></div>
				<div class="field"><label class="field-label">TOTAL</label><input type="number" bind:value={cs_total} /></div>
				<div class="field"><label class="field-label">Pts from avg</label><input type="number" bind:value={cs_pts} /></div>
			</div>
			<p class="field-label mt">Derived Stats</p>
			<div class="stat-grid">
				<div class="field"><label class="field-label">HP</label><input type="number" step="any" bind:value={cs_hp} /></div>
				<div class="field"><label class="field-label">MP</label><input type="number" step="any" bind:value={cs_mp} /></div>
				<div class="field"><label class="field-label">SP</label><input type="number" step="any" bind:value={cs_sp} /></div>
			</div>
		</div>
		{/if}

		<!-- ── Character ranking ── -->
		{#if entityType === 'character_ranking'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Character</label>
					<select bind:value={cr_charId}>
						<option value={null}>— select —</option>
						{#each data.characters as c}<option value={c.id}>{c.first_name} {c.last_name}</option>{/each}
					</select>
				</div>
				<div class="field field--sm">
					<label class="field-label">Rank</label>
					<input type="number" bind:value={cr_rank} placeholder="exact rank" />
				</div>
				<div class="field field--sm">
					<label class="field-label">Known Above</label>
					<input type="number" bind:value={cr_above} placeholder="if estimated" />
				</div>
				<div class="field field--sm">
					<label class="field-label">Date Noted</label>
					<input type="date" bind:value={cr_dateNoted} />
				</div>
			</div>
		</div>
		{/if}

		<!-- ── Character orb ── -->
		{#if entityType === 'character_orb'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Character</label>
					<select bind:value={co_charId}>
						<option value={null}>— select —</option>
						{#each data.characters as c}<option value={c.id}>{c.first_name} {c.last_name}</option>{/each}
					</select>
				</div>
				<div class="field">
					<label class="field-label">Orb</label>
					<select bind:value={co_orbId}>
						<option value={null}>— select —</option>
						{#each data.orbs as o}<option value={o.id}>{o.orb_name}</option>{/each}
					</select>
				</div>
				<div class="field field--sm">
					<label class="field-label">Date Acquired</label>
					<input type="date" bind:value={co_dateAcquired} />
				</div>
				<div class="field field--wide">
					<label class="field-label">Date Note <span class="hint">if approximate or supplemental</span></label>
					<input type="text" placeholder="e.g. Early Nov 2018, or 'Used immediately after acquisition'" bind:value={co_dateNote} />
				</div>
			</div>
		</div>
		{/if}

		<!-- ── Orb drop rate ── -->
		{#if entityType === 'orb_drop_rate'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Orb</label>
					<select bind:value={dr_orbId}>
						<option value={null}>— select —</option>
						{#each data.orbs as o}<option value={o.id}>{o.orb_name}</option>{/each}
					</select>
				</div>
				<div class="field">
					<label class="field-label">Creature</label>
					<select bind:value={dr_monsterId}>
						<option value={null}>— none —</option>
						{#each data.monsters as m}<option value={m.id}>{m.name}</option>{/each}
					</select>
				</div>
				{#if !dr_monsterId}
					<div class="field field--wide">
						<label class="field-label">Creature label</label>
						<input type="text" placeholder="Free-text fallback — only needed when the creature isn't in the dropdown above" bind:value={dr_creature} />
					</div>
				{/if}
				<div class="field">
					<label class="field-label">Dungeon</label>
					<select bind:value={dr_dungeon}>
						<option value="">— unknown —</option>
						{#each data.dungeons as d}<option value={d.name}>{d.name}</option>{/each}
					</select>
				</div>
				<div class="field field--sm">
					<label class="field-label">Floor</label>
					<input type="text" placeholder="e.g. 2, B1, or 5–7" bind:value={dr_floor} />
				</div>
				<div class="field field--wide">
					<label class="field-label">Drop rate <span class="hint">e.g. 1 per 280,000,000 kills</span></label>
					<div class="drops-row">
						<input type="text" inputmode="numeric" class="drops-row__drops"
							placeholder="1" aria-label="Drops"
							value={formatThousands(dr_favOut)}
							oninput={(e) => handleCommaInput(e, (v) => dr_favOut = v)} />
						<span class="drops-row__sep">per</span>
						<input type="text" inputmode="numeric" class="drops-row__total"
							placeholder="280,000,000" aria-label="Per kills"
							value={formatThousands(dr_total)}
							oninput={(e) => handleCommaInput(e, (v) => dr_total = v)} />
						<span class="drops-row__sep">kills</span>
					</div>
				</div>
			</div>
		</div>
		{/if}

		<!-- ── Monster ↔ Dungeon presence ── -->
		{#if entityType === 'monster_dungeon'}
		<div class="card form-section">
			<div class="field-grid">
				<div class="field">
					<label class="field-label">Creature</label>
					<select bind:value={md_monsterId}>
						<option value={null}>— select —</option>
						{#each data.monsters as m}<option value={m.id}>{m.name}</option>{/each}
					</select>
				</div>
				<div class="field">
					<label class="field-label">Dungeon</label>
					<select bind:value={md_dungeonId}>
						<option value={null}>— select —</option>
						{#each data.dungeons as d}<option value={d.id}>{d.name}</option>{/each}
					</select>
				</div>
				<div class="field field--sm">
					<label class="field-label">Floor</label>
					<input type="text" placeholder="e.g. 2, B1, or 5–7" bind:value={md_floor} />
				</div>
			</div>
		</div>
		{/if}

		<!-- ── Citation (shared) ── -->
		{#if !['character_stat','character_ranking','character_orb','orb_drop_rate'].includes(entityType) || true}
		<div class="card form-section">
			<p class="section-heading">Citation</p>
			<div class="field-grid">
				<div class="field field--sm">
					<label class="field-label">Volume</label>
					<input type="text" placeholder="e.g. 1" bind:value={cite_vol} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Chapter</label>
					<input type="text" placeholder="e.g. 3" bind:value={cite_ch} />
				</div>
				<div class="field field--sm">
					<label class="field-label">JNC Part</label>
					<input type="text" placeholder="e.g. 2" bind:value={cite_part} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Source Type</label>
					<select bind:value={cite_source_type}>
						<option value={null}>—</option>
						<option value="Light Novel">Light Novel</option>
						<option value="Manga">Manga</option>
					</select>
				</div>
			</div>
		</div>
		{/if}
		{/if}

	</form>
	</div>
</div>

<dialog bind:this={deleteDialog} class="confirm-dialog" onclose={() => {}}>
	<h3 class="confirm-dialog__title">Delete this record?</h3>
	<p class="confirm-dialog__body">
		An admin will review this deletion request for <code>#{entityId}</code>
		({entityType.replace(/_/g, ' ')}) before the record is removed.
	</p>
	<div class="confirm-dialog__actions">
		<button type="button" class="btn btn--ghost" onclick={cancelDelete}>Cancel</button>
		<button type="button" class="btn btn--danger" onclick={confirmDelete}>Delete</button>
	</div>
</dialog>

<style>
	.banner {
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.9375rem;
	}
	.banner--success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
	.banner--error   { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

	@media (prefers-color-scheme: dark) {
		.banner--success { background: #052e1a; color: #6ee7b7; border-color: #065f46; }
		.banner--error   { background: #2d0a0a; color: #fca5a5; border-color: #991b1b; }
	}
	:global([data-theme="dark"]) .banner--success { background: #052e1a; color: #6ee7b7; border-color: #065f46; }
	:global([data-theme="dark"]) .banner--error   { background: #2d0a0a; color: #fca5a5; border-color: #991b1b; }
	:global([data-theme="light"]) .banner--success { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }
	:global([data-theme="light"]) .banner--error   { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }

	.form-section { margin-bottom: 1rem; }

	.delete-confirm { border-color: #fca5a5; background: #fef2f2; }
	:global([data-theme="dark"]) .delete-confirm { background: #2d0a0a; border-color: #991b1b; }
	.delete-confirm__title {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #991b1b;
		margin: 0 0 0.5rem;
	}
	.delete-confirm__body { font-size: 0.9rem; color: var(--text-2); margin: 0; line-height: 1.55; }
	.delete-confirm__body code {
		font-family: var(--font-mono);
		font-size: 0.85em;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}

	.confirm-dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--bg-card);
		color: var(--text);
		padding: 1.5rem 1.75rem;
		max-width: 28rem;
		width: calc(100% - 2rem);
		box-shadow: var(--shadow-hover);
	}
	.confirm-dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
	}
	.confirm-dialog__title {
		font-size: 1.0625rem;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 0.5rem;
	}
	.confirm-dialog__body {
		font-size: 0.9rem;
		color: var(--text-2);
		line-height: 1.6;
		margin: 0 0 1.25rem;
	}
	.confirm-dialog__body code {
		font-family: var(--font-mono);
		font-size: 0.85em;
		background: var(--bg-subtle);
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}
	.confirm-dialog__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.625rem;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.875rem;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.625rem;
		margin-top: 0.5rem;
	}

	.field { display: flex; flex-direction: column; gap: 0.3rem; }
	.field--sm { max-width: 160px; }
	.field--wide { grid-column: 1 / -1; }

	.drops-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.drops-row__drops { width: 5rem !important;  flex: 0 0 auto; }
	.drops-row__total { width: 14rem !important; flex: 0 0 auto; }
	.drops-row__sep   { color: var(--text-3); font-size: 0.875rem; flex-shrink: 0; }

	.field-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-3);
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.hint {
		font-size: 0.625rem;
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--text-3);
	}

	.mt { margin-top: 1rem; }

	input[type="text"], input[type="number"], input[type="date"],
	input[type="time"], select, textarea {
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text);
		font-size: 0.9rem;
		font-family: var(--font-sans);
		width: 100%;
	}

	textarea {
		resize: vertical;
		line-height: 1.6;
		font-family: var(--font-sans);
	}

	.check-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-2);
		cursor: pointer;
		user-select: none;
	}

	.toggle-label input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }

	.toggle-track {
		position: relative;
		width: 36px;
		height: 20px;
		background: var(--border);
		border-radius: 10px;
		flex-shrink: 0;
		transition: background 0.2s;
	}

	.toggle-track::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #fff;
		transition: transform 0.2s;
	}

	.toggle-label input:checked ~ .toggle-track { background: var(--accent); }
	.toggle-label input:checked ~ .toggle-track::after { transform: translateX(16px); }

	.array-add {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--accent);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		min-height: 1.5rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.15rem 0.45rem 0.15rem 0.6rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.8rem;
		color: var(--text-2);
		white-space: nowrap;
		line-height: 1.4;
	}

	.chip-remove {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-3);
		font-size: 0.625rem;
		padding: 0;
		line-height: 1;
		display: inline-flex;
		align-items: center;
	}

	.chip-remove:hover { color: #dc2626; }

	.chip-input-inline {
		border: 1px solid var(--border) !important;
		border-radius: var(--radius) !important;
		background: var(--bg) !important;
		padding: 0.2rem 0.5rem !important;
		font-size: 0.8125rem !important;
		width: 140px !important;
		height: auto !important;
	}

	.chip-input-wrap {
		position: relative;
		display: inline-block;
	}

	.chip-suggestions {
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		min-width: 100%;
		max-width: 240px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow-hover);
		z-index: 60;
		padding: 0.2rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.chip-suggestion {
		text-align: left;
		background: none;
		border: none;
		padding: 0.3rem 0.5rem;
		font-size: 0.8125rem;
		color: var(--text-2);
		border-radius: 3px;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chip-suggestion:hover {
		background: var(--accent-bg);
		color: var(--accent);
	}

	:global(.form-bar) {
		position: sticky;
		top: 52px;
		z-index: 50;
		background: var(--bg);
		border-bottom: 1px solid var(--border-soft);
		padding: 0.5rem 0;
	}

	:global(.form-bar__inner) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	:global(.form-bar__title) {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		font-size: 1rem;
		font-weight: 700;
	}

	:global(.form-bar__sub) {
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--text-3);
	}

	:global(.form-bar__actions) {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-shrink: 0;
	}

	:global(.form-bar__err) { font-size: 0.8125rem; color: #991b1b; }

	:global(.contribute-body) {
		height: calc(100vh - 52px - 57px);
		overflow-y: auto;
		padding: 1.5rem 0;
	}
</style>
