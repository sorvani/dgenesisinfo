<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const TIMEZONES = ['JST','EST','CST','MST','PST','UTC','GMT','CET','EET','IST','KST'];
	const SCAN_TYPES = ['Making','Appraisal','Stat Measuring Device'];
	const CATEGORIES = ['Humanoid','Beast','Undead','Demon','Aberration','Aquatic','Elemental','Ooze','Unknown'];

	let entityType = $state(data.defaultType);
	let operation  = $state(data.defaultOp);
	let entityId   = $state<number | null>(data.defaultEntityId);

	// ── Character fields ──────────────────────────────────────────────────────
	let c_firstName      = $state('');
	let c_lastName       = $state('');
	let c_monikers       = $state<string[]>([]);
	let c_nationality    = $state('');
	let c_sex            = $state('');
	let c_birthday       = $state('');
	let c_dateFirstKnown = $state('');
	let c_area           = $state<number | null>(null);
	let c_note        = $state('');
	let c_tags        = $state<string[]>([]);
	let c_isExplorer  = $state(true);
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
	let cs_charId      = $state<number | null>(null);
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
	let cr_charId    = $state<number | null>(null);
	let cr_rank      = $state<number | null>(null);
	let cr_above     = $state<number | null>(null);
	let cr_dateNoted = $state('');

	// ── Character orb fields ──────────────────────────────────────────────────
	let co_charId       = $state<number | null>(null);
	let co_orbId        = $state<number | null>(null);
	let co_dateAcquired = $state('');
	let co_dateNote     = $state('');

	// ── Orb drop rate fields ──────────────────────────────────────────────────
	let dr_orbId    = $state<number | null>(null);
	let dr_creature = $state('');
	let dr_dungeon  = $state('');
	let dr_floor    = $state('');
	let dr_favOut   = $state<number | null>(null);
	let dr_total    = $state<number | null>(null);

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
		} else if (entityType === 'monster') {
			const m = data.monsters.find(m => m.id === entityId);
			if (!m) return;
			m_name     = m.name;
			m_category = m.category ?? 'Unknown';
			m_note     = m.note ?? '';
		}
	});

	function addMoniker() { c_monikers = [...c_monikers, '']; }
	function removeMoniker(i: number) { c_monikers = c_monikers.filter((_, idx) => idx !== i); }
	function addTag() { c_tags = [...c_tags, '']; }
	function removeTag(i: number) { c_tags = c_tags.filter((_, idx) => idx !== i); }

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

		if (entityType === 'orb_drop_rate') return JSON.stringify({
			orb_id: dr_orbId, creature: dr_creature || null, dungeon: dr_dungeon || null,
			floor: dr_floor || null, favorable_outcomes: dr_favOut, total_events: dr_total, citation: cite,
		}, null, 2);

		return '{}';
	}

	let formEl: HTMLFormElement;

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const hidden = formEl.querySelector<HTMLInputElement>('[name="proposed_data"]')!;
		hidden.value = buildProposedData();
		formEl.submit();
	}
</script>

<svelte:head><title>Contribute — D-Genesis Info</title></svelte:head>

<div class="container page">
	<h1 class="page-title">Submit a Contribution</h1>
	<p class="page-subtitle">All submissions are reviewed by an admin before being applied.</p>

	{#if form?.success}
		<div class="banner banner--success">Submission received — thank you!</div>
	{/if}
	{#if form?.error}
		<div class="banner banner--error">{form.error}</div>
	{/if}

	<form bind:this={formEl} method="POST" action="?/submit" onsubmit={handleSubmit}>
		<input type="hidden" name="entity_type" value={entityType} />
		<input type="hidden" name="operation"   value={operation} />
		<input type="hidden" name="entity_id"   value={entityId ?? ''} />
		<input type="hidden" name="proposed_data" value="" />

		<!-- ── Control row ── -->
		<div class="card ctrl-row">
			<div class="field">
				<label class="field-label" for="f-type">Type</label>
				<select id="f-type" bind:value={entityType}>
					<option value="character">Character / Explorer</option>
					<option value="orb">Skill Orb</option>
					<option value="dungeon">Dungeon</option>
					<option value="monster">Monster / Creature</option>
					<option value="timeline_event">Timeline Event</option>
					<option value="character_stat">Character Stat Reading</option>
					<option value="character_ranking">Character Ranking</option>
					<option value="character_orb">Character Orb Acquisition</option>
					<option value="orb_drop_rate">Orb Drop Rate</option>
				</select>
			</div>

			<div class="field">
				<label class="field-label" for="f-op">Operation</label>
				<select id="f-op" bind:value={operation}>
					{#if !entityId}<option value="insert">New record</option>{/if}
					<option value="update">Update existing</option>
					<option value="delete">Delete record</option>
				</select>
			</div>

			{#if operation !== 'insert' && entityId}
				<div class="field field--sm">
					<label class="field-label">Record ID</label>
					<div class="readonly-id">#{entityId}</div>
				</div>
			{/if}
		</div>

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
					<button type="button" class="array-add" onclick={addMoniker}>+ Add</button>
				</label>
				{#each c_monikers as _, i}
					<div class="array-row">
						<input type="text" bind:value={c_monikers[i]} placeholder='e.g. "The Phantom"' />
						<button type="button" class="array-remove" onclick={() => removeMoniker(i)}>✕</button>
					</div>
				{/each}
			</div>

			<div class="field mt">
				<label class="field-label">Tags
					<button type="button" class="array-add" onclick={addTag}>+ Add</button>
				</label>
				{#each c_tags as _, i}
					<div class="array-row">
						<input type="text" bind:value={c_tags[i]} placeholder="e.g. D-Powers" />
						<button type="button" class="array-remove" onclick={() => removeTag(i)}>✕</button>
					</div>
				{/each}
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
				<div class="field"><label class="field-label">HP</label><input type="number" step="0.01" bind:value={cs_hp} /></div>
				<div class="field"><label class="field-label">MP</label><input type="number" step="0.01" bind:value={cs_mp} /></div>
				<div class="field"><label class="field-label">SP</label><input type="number" step="0.01" bind:value={cs_sp} /></div>
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
				<div class="field">
					<label class="field-label">Date Note <span class="hint">if approximate</span></label>
					<input type="text" placeholder="e.g. Early Nov 2018" bind:value={co_dateNote} />
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
					<label class="field-label">Creature / Monster</label>
					<input type="text" bind:value={dr_creature} />
				</div>
				<div class="field">
					<label class="field-label">Dungeon</label>
					<select bind:value={dr_dungeon}>
						<option value="">— unknown —</option>
						{#each data.dungeons as d}<option value={d.name}>{d.name}</option>{/each}
					</select>
				</div>
				<div class="field field--sm">
					<label class="field-label">Floor</label>
					<input type="text" placeholder='e.g. 2<sup>nd</sup>' bind:value={dr_floor} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Favorable Outcomes</label>
					<input type="number" bind:value={dr_favOut} />
				</div>
				<div class="field field--sm">
					<label class="field-label">Total Events</label>
					<input type="number" bind:value={dr_total} />
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

		<div class="form-footer">
			<button type="submit" class="btn btn--primary">Submit for review</button>
		</div>
	</form>
</div>

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

	.ctrl-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1rem;
		align-items: flex-end;
	}

	.form-section { margin-bottom: 1rem; }

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

	.array-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.375rem;
	}

	.array-remove {
		flex-shrink: 0;
		padding: 0.35rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: none;
		color: var(--text-3);
		cursor: pointer;
		font-size: 0.75rem;
	}

	.array-remove:hover { color: #dc2626; border-color: #dc2626; }

	.readonly-id {
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-subtle);
		color: var(--text-3);
		font-family: var(--font-mono);
		font-size: 0.9rem;
	}

	.form-footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}
</style>
