"use client";

import { useState } from 'react';
import { type Orb, type Character, type TimelineEvent, getIANATimezone } from '@/lib/data';

interface Props {
  orbs: Orb[];
  characters: Character[];
  timeline: TimelineEvent[];
}

// ─── Dynamic Form Engine Definitions ─────────────────────────────────────

type FieldType = 'text' | 'number' | 'textarea' | 'date' | 'time' | 'timezone_select' | 'boolean' | 'hidden';
interface FieldDef { key: string; label: string; type: FieldType; required?: boolean; }

const citationSchema: FieldDef[] = [
  { key: 'citation.volume', label: 'Citation: Volume', type: 'text' },
  { key: 'citation.chapter', label: 'Citation: Chapter', type: 'text' },
  { key: 'citation.jnc_part', label: 'Citation: JNC Part', type: 'text' }
];

const orbBaseSchema: FieldDef[] = [
  { key: 'slug', label: 'Slug (ID)', type: 'text', required: true },
  { key: 'orb_name', label: 'Orb Name', type: 'text' },
  { key: 'known_effects', label: 'Known Effects (HTML OK)', type: 'textarea' },
  { key: 'note', label: 'Note', type: 'textarea' },
];

const dropRateSchema: FieldDef[] = [
  { key: 'creature', label: 'Creature', type: 'text' },
  { key: 'dungeon', label: 'Dungeon', type: 'text' },
  { key: 'floor', label: 'Floor', type: 'text' },
  { key: 'favorable_outcomes', label: 'Favorable Outcomes', type: 'number' },
  { key: 'total_events', label: 'Total Events', type: 'number' },
  ...citationSchema
];

const characterBaseSchema: FieldDef[] = [
  { key: 'slug', label: 'Slug (ID)', type: 'text', required: true },
  { key: 'first_name', label: 'First Name', type: 'text' },
  { key: 'last_name', label: 'Last Name', type: 'text' },
  { key: 'moniker', label: 'Moniker', type: 'text' },
  { key: 'nationality', label: 'Nationality (e.g. JP, US)', type: 'text' },
  { key: 'date_first_known', label: 'Date First Known', type: 'date' },
  { key: 'in_wdarl', label: 'In WDARL (Enables Stats/Rankings)', type: 'boolean' },
  { key: 'public', label: 'Public on WDARL', type: 'boolean' },
  { key: 'area', label: 'Area on D-Card', type: 'number' },
  { key: 'birthday', label: 'Birthday', type: 'text' },
  { key: 'sex', label: 'Sex', type: 'text' },
  { key: '_initial_rank', label: 'Initial Rank (New Character Only)', type: 'number' },
  { key: '_initial_stat_total', label: 'Initial Stat Total (New Character Only)', type: 'number' },
  { key: '_initial_orb_id', label: 'Initial Orb ID Acquired (New Character Only)', type: 'number' },
  { key: 'tags', label: 'Tags (comma separated)', type: 'text' },
  { key: 'note', label: 'Note (HTML OK)', type: 'textarea' },
  ...citationSchema
];

const rankingSchema: FieldDef[] = [
  { key: 'rank', label: 'Rank', type: 'number' },
  { key: 'known_above_rank', label: 'Known Above Rank', type: 'number' },
  { key: 'date_noted', label: 'Date Noted', type: 'date' },
  ...citationSchema
];

const orbUsedSchema: FieldDef[] = [
  { key: 'orb_id', label: 'Orb ID (Numeric)', type: 'number' },
  { key: 'date_acquired', label: 'Date Acquired', type: 'date' },
  { key: 'date_note', label: 'Date Note', type: 'textarea' },
  ...citationSchema
];

const timelineSchema: FieldDef[] = [
  { key: 'id', label: 'ID', type: 'hidden' },
  { key: 'local_date', label: 'Local Date', type: 'date', required: true },
  { key: 'local_time', label: 'Local Time (24-hour)', type: 'time' },
  { key: 'timezone', label: 'Timezone', type: 'timezone_select', required: true },
  { key: 'date_label', label: 'Date Label Override', type: 'text' },
  { key: 'display_time', label: 'Display Specific Time', type: 'boolean' },
  { key: 'pre_history', label: 'Pre-History Event', type: 'boolean' },
  { key: 'event', label: 'Details (HTML OK)', type: 'textarea', required: true },
  ...citationSchema
];

const statSchema: FieldDef[] = [
  { key: 'date_noted', label: 'Date Noted', type: 'date' },
  { key: 'date_sequence', label: 'Sequence on Date', type: 'number' },
  { key: 'scan_type', label: 'Scan Type', type: 'text' },
  { key: 'sp', label: 'SP', type: 'number' },
  { key: 'hp', label: 'HP', type: 'number' },
  { key: 'mp', label: 'MP', type: 'number' },
  { key: 'str', label: 'STR', type: 'number' },
  { key: 'vit', label: 'VIT', type: 'number' },
  { key: 'int', label: 'INT', type: 'number' },
  { key: 'agi', label: 'AGI', type: 'number' },
  { key: 'dex', label: 'DEX', type: 'number' },
  { key: 'luc', label: 'LUC', type: 'number' },
  { key: 'stat_total', label: 'Total Stats', type: 'number' },
  ...citationSchema
];

const getVal = (obj: any, key: string) => {
  if (!obj) return '';
  if (key.includes('.')) {
    const [a,b] = key.split('.');
    return (obj[a] && obj[a][b] !== undefined && obj[a][b] !== null) ? obj[a][b] : '';
  }
  return (obj[key] !== undefined && obj[key] !== null) ? obj[key] : '';
};

const setVal = (obj: any, key: string, val: string | number | boolean | null) => {
  const newObj = JSON.parse(JSON.stringify(obj || {})); 
  if (key.includes('.')) {
    const [a,b] = key.split('.');
    if (!newObj[a] && val !== null && val !== '') newObj[a] = {};
    if (newObj[a]) newObj[a][b] = val === '' ? null : val;
  } else {
    newObj[key] = val === '' ? null : val;
  }
  return newObj;
};

// ─── Dynamic Form Component ──────────────────────────────────────────────

function DynamicForm({ schema, initialData, onSave, onCancel, actionName }: { schema: FieldDef[], initialData: any, onSave: (d: any) => void, onCancel: () => void, actionName: string }) {
  const [data, setData] = useState<any>(initialData || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in" style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
      <h3 style={{ marginBottom: 'var(--space-md)', marginTop: 0 }}>{actionName}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
        {schema.map(field => {
          const val = getVal(data, field.key);
          const onChange = (e: any) => {
            let newVal: string | number | null = e.target.value;
            if (field.type === 'number' && newVal !== '') newVal = Number(newVal);
            setData(setVal(data, field.key, newVal));
          };

          const inputStyle = { width: '100%', padding: 'var(--space-sm)', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' };

          if (field.type === 'hidden') return null;

          if (field.key.startsWith('_initial_') && (initialData.slug || data.in_wdarl === false)) return null;

          return (
            <div key={field.key} style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: 'var(--space-xs)' }}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea value={val as string} onChange={onChange} rows={3} required={field.required} style={inputStyle} />
              ) : field.type === 'boolean' ? (
                <input type="checkbox" checked={!!val} onChange={(e) => setData(setVal(data, field.key, e.target.checked))} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              ) : field.type === 'number' ? (
                <input type="number" step="any" value={val as number|string} onChange={onChange} required={field.required} style={inputStyle} />
              ) : field.type === 'date' ? (
                <input type="date" value={val as string} onChange={onChange} required={field.required} style={inputStyle} />
              ) : field.type === 'time' ? (
                <input type="time" step="1" value={data.display_time ? (val as string) : ''} disabled={!data.display_time} onChange={onChange} required={field.required && data.display_time} style={{ ...inputStyle, opacity: data.display_time ? 1 : 0.5, cursor: data.display_time ? 'auto' : 'not-allowed' }} title={!data.display_time ? 'Time is locked because Display Specific Time is unchecked. Defaults to Noon.' : ''} />
              ) : field.type === 'timezone_select' ? (
                <select value={val as string} onChange={onChange} required={field.required} style={inputStyle}>
                  <option value="">-- Select Timezone --</option>
                  <option value="JST">JST (Japan Standard Time)</option>
                  <option value="EST">EST (Eastern Time)</option>
                  <option value="CST">CST (Central Time)</option>
                  <option value="MST">MST (Mountain Time)</option>
                  <option value="PST">PST (Pacific Time)</option>
                  <option disabled>──────────</option>
                  <option value="UTC">UTC</option>
                  <option value="GMT">GMT</option>
                  <option value="CET">CET (Central European Time)</option>
                  <option value="EET">EET (Eastern European Time)</option>
                  <option value="IST">IST (Indian Standard Time)</option>
                  <option value="KST">KST (Korea Standard Time)</option>
                  <option value="CST_CN">CST_CN (China Standard Time)</option>
                </select>
              ) : (
                <input type="text" value={val as string} onChange={onChange} required={field.required} style={inputStyle} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
        <button type="submit" style={{ background: 'var(--accent-teal)', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save & Generate Issue</button>
        <button type="button" onClick={onCancel} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  )
}

// ─── List View Component ─────────────────────────────────────────────────

function ListView({ items, summaryFn, onAdd, onEdit, onCopy, onDelete }: { items: any[], summaryFn: (i: any) => string, onAdd: () => void, onEdit: (i: any) => void, onCopy: (i: any) => void, onDelete: (i: any) => void }) {
  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Existing Entries ({items?.length || 0})</h3>
        <button onClick={onAdd} style={{ background: 'var(--accent-amber)', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Add New Entry</button>
      </div>
      
      {!items || items.length === 0 ? (
        <div style={{ padding: 'var(--space-lg)', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No entries found for this array.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ padding: 'var(--space-sm) var(--space-md)', background: idx % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)', borderBottom: idx < items.length-1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', flex: 1, paddingRight: 'var(--space-md)', fontFamily: 'var(--font-mono)' }}>
                {summaryFn(item)}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button onClick={() => onEdit(item)} style={{ cursor: 'pointer', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 8px' }}>✏️ Edit</button>
                <button onClick={() => onCopy(item)} style={{ cursor: 'pointer', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 8px' }}>📋 Copy</button>
                <button onClick={() => onDelete(item)} style={{ cursor: 'pointer', background: 'var(--accent-red)', color: 'white', border: '1px solid var(--accent-red)', borderRadius: '4px', padding: '4px 8px', fontWeight: 'bold' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────

type ViewState = 'list' | 'form';
type EditAction = 'add' | 'edit' | 'copy';

export function ContributeForm({ orbs, characters, timeline }: Props) {
  const [type, setType] = useState<'orb' | 'character' | 'timeline'>('character');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [section, setSection] = useState<string>('base'); 
  
  // View State logic
  const [viewState, setViewState] = useState<ViewState>('list');
  const [editAction, setEditAction] = useState<EditAction>('edit');
  const [activeItem, setActiveItem] = useState<any>(null);

  const resetFlow = () => {
    setViewState('list');
    setActiveItem(null);
  };

  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'orb' | 'character' | 'timeline';
    setType(newType);
    if (newType === 'timeline') {
      setSelectedSlug('timeline');
      setSection('events');
    } else {
      setSelectedSlug('');
      setSection('base');
    }
    resetFlow();
  };

  const handleEntitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSlug(e.target.value);
    resetFlow();
  };
  
  const handleSectionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSection(e.target.value);
    resetFlow();
  };

  // Build current context
  let schema: FieldDef[] = [];
  let items: any[] = [];
  let isArray = false;
  let sectionName = "Base Details";

  let entity: any = null;
  if (selectedSlug) {
    if (type === 'timeline') {
      entity = { events: timeline };
      schema = timelineSchema;
      items = [...timeline];
      isArray = true;
      sectionName = "Events";
    } else if (type === 'orb') {
      if (selectedSlug === '__new__') {
        entity = {};
      } else {
        const found = orbs.find(o => o.slug === selectedSlug);
        entity = found ? { ...found } : null;
      }
      if (section === 'base') {
        schema = orbBaseSchema;
        if (entity) delete entity.drop_rates;
      } else if (section === 'drop_rates') {
        schema = dropRateSchema; items = entity?.drop_rates || []; isArray = true; sectionName = "Drop Rates";
      }
    } else {
      if (selectedSlug === '__new__') {
        entity = { in_wdarl: true }; // default to true
      } else {
        const found = characters.find(ex => ex.slug === selectedSlug);
        entity = found ? { ...found } : null;
      }
      if (section === 'base') {
        schema = characterBaseSchema;
        if (entity) {
          delete entity.rankings;
          delete entity.stats;
          delete entity.orbs_used;
          if (Array.isArray(entity.tags)) {
            entity.tags = entity.tags.join(', ');
          }
        }
      } else if (section === 'rankings') {
        schema = rankingSchema; items = entity?.rankings || []; isArray = true; sectionName = "Rankings";
      } else if (section === 'orbs_used') {
        schema = orbUsedSchema; items = entity?.orbs_used || []; isArray = true; sectionName = "Orbs Used";
      } else if (section === 'stats') {
        schema = statSchema; items = entity?.stats || []; isArray = true; sectionName = "Stats";
      }
    }
  }

  // Formatting helper specifically for the list view
  const getSummary = (item: any) => {
    if (section === 'drop_rates') return `${item.creature || 'Unknown Creature'} (Floor: ${item.floor || '?'})`;
    if (section === 'rankings') return `Rank ${item.rank || (item.known_above_rank ? `> ${item.known_above_rank}` : '?')} (${item.date_noted || 'No Date'})`;
    if (section === 'stats') return `Total: ${item.stat_total || '?'} | Scan: ${item.scan_type || '?'} (${item.date_noted || 'No Date'})`;
    if (section === 'orbs_used') return `Orb ID: ${item.orb_id || '?'} (${item.date_acquired || 'No Date'})`;
    if (section === 'events') return `${item.date_label || item.date_utc}: ${(item.event || '').substring(0, 50)}...`;
    return JSON.stringify(item).substring(0, 50)+'...';
  };

  const executeGitHubRedirect = (actionType: string, payloadStr: string) => {
    const target = type === 'timeline' ? 'Timeline Event' : `${type === 'orb' ? 'Orb' : 'Character'} (${selectedSlug}) -> ${sectionName}`;
    const entityTitle = type === 'timeline' ? 'Timeline' : type === 'orb' ? 'Orb' : 'Character';
    const title = type === 'timeline' ? `Update Timeline Event` : `Update ${entityTitle}: ${selectedSlug}`;
    const body = `### Proposed Contribution\n**Action:** \`${actionType}\`\n**Target:** \`${target}\`\n\n**Payload:**\n\`\`\`json\n${payloadStr}\n\`\`\`\n`;
    const url = `https://github.com/sorvani/dgenesisinfo/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const normalizeBirthday = (bday: string) => {
    if (!bday) return bday;
    const d = new Date(bday + (bday.match(/\d{4}/) ? '' : ' 2000'));
    if (!isNaN(d.getTime())) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    }
    return bday;
  };

  const prepareTimelineData = (item: any) => {
    if (type !== 'timeline' || !item) return item;
    const mapped = { ...item };
    if (mapped.date_utc) {
      const iana = getIANATimezone(mapped.timezone || 'JST');
      try {
        const localDt = new Date(mapped.date_utc).toLocaleString('sv', { timeZone: iana });
        const [ld, lt] = localDt.split(' ');
        mapped.local_date = ld;
        mapped.local_time = lt;
      } catch (e) {}
    } else {
      mapped.local_date = '';
      mapped.local_time = '00:00:00';
      if (!mapped.timezone) mapped.timezone = 'JST';
    }
    return mapped;
  };

  const handleSaveForm = (data: any) => {
    const payload = { ...data };
    
    if (type === 'timeline') {
      const { local_date, local_time: _discard_time, ...rest } = payload;
      let local_time = _discard_time;
      
      if (rest.id == null || rest.id === '') {
        const maxId = timeline.reduce((max, evt) => Math.max(max, evt.id || 0), 0);
        rest.id = maxId + 1;
      }

      if (!rest.display_time || !local_time) {
        local_time = '12:00:00';
      }

      // Cleanup citations if empty
      if (rest.citation) {
        if (!rest.citation.volume && !rest.citation.chapter && !rest.citation.jnc_part) {
          rest.citation = null;
        }
      }

      if (local_date && local_time) {
        const iana = getIANATimezone(rest.timezone || 'JST');
        const localUTC = new Date(`${local_date}T${local_time}Z`);
        let currentUTC = localUTC.getTime();
        for(let i=0; i<3; i++) {
           const rendered = new Date(currentUTC).toLocaleString('sv', { timeZone: iana });
           const renderedLocalUTC = new Date(rendered.replace(' ', 'T') + 'Z').getTime();
           const diff = localUTC.getTime() - renderedLocalUTC;
           if (diff === 0) break;
           currentUTC += diff;
        }
        rest.date_utc = new Date(currentUTC).toISOString().split('.')[0] + 'Z';
      }
      
      executeGitHubRedirect(editAction.toUpperCase(), JSON.stringify(rest, null, 2));
      if (isArray) setViewState('list');
      return;
    }
    
    if (payload.birthday) {
      payload.birthday = normalizeBirthday(payload.birthday);
    }
    
    if (section === 'base' && selectedSlug === '__new__') {
       if (payload._initial_rank) {
         payload.rankings = [{ rank: payload._initial_rank, known_above_rank: null, date_noted: payload.date_first_known || null, citation: null }];
       } else { payload.rankings = []; }
       
       if (payload._initial_stat_total) {
         payload.stats = [{ stat_total: payload._initial_stat_total, points_from_average: payload._initial_stat_total - 60, date_noted: payload.date_first_known || null, date_sequence: 1, scan_type: null, sp: null, hp: null, mp: null, str: null, vit: null, int: null, agi: null, dex: null, luc: null, citation: null }];
       } else { payload.stats = []; }
       
       if (payload._initial_orb_id) {
         payload.orbs_used = [{ orb_id: payload._initial_orb_id, date_acquired: payload.date_first_known || null, date_note: null, citation: null }];
       } else { payload.orbs_used = []; }
    }
    
    delete payload._initial_rank;
    delete payload._initial_stat_total;
    delete payload._initial_orb_id;

    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    // Auto-calculate points_from_average for stat entries (average is 60)
    if (section === 'stats' && payload.stat_total != null) {
      payload.points_from_average = payload.stat_total - 60;
    }
    executeGitHubRedirect(editAction.toUpperCase(), JSON.stringify(payload, null, 2));
    if (isArray) setViewState('list');
  };

  const handleDelete = (item: any) => {
    if (window.confirm("Are you sure you want to propose deleting this entry?")) {
      executeGitHubRedirect('DELETE', JSON.stringify(item, null, 2));
    }
  };

  return (
    <div>
      <div className="contribute-form-selectors">
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Record Type</label>
          <select value={type} onChange={handleTypeSelect} style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="character">Character Data</option>
            <option value="orb">Skill Orb</option>
            <option value="timeline">Timeline</option>
          </select>
        </div>
        
        {type !== 'timeline' && (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Select Record</label>
            <select value={selectedSlug} onChange={handleEntitySelect} style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              <option value="">-- Choose {type === 'orb' ? 'an orb' : 'a character'} to edit --</option>
              <option value="__new__" style={{ fontWeight: 'bold' }}>➕ Create New {type === 'orb' ? 'Orb' : 'Character'}</option>
              {type === 'orb' 
                ? orbs.map(o => <option key={o.slug} value={o.slug}>{o.orb_name || o.slug}</option>)
                : characters.map(e => <option key={e.slug} value={e.slug}>{e.first_name} {e.last_name || ''}</option>)
              }
            </select>
          </div>
        )}

        <div>
          {selectedSlug ? (
            <div className="animate-in">
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Section to Edit</label>
              <select value={section} onChange={handleSectionSelect} disabled={type === 'timeline' || selectedSlug === '__new__'} style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: (type === 'timeline' || selectedSlug === '__new__') ? 'var(--bg-secondary)' : 'var(--bg-primary)', color: 'var(--text-primary)', cursor: (type === 'timeline' || selectedSlug === '__new__') ? 'not-allowed' : 'auto' }}>
                {type === 'timeline' ? (
                  <option value="events">All Events Array</option>
                ) : (
                  <option value="base">Base Details</option>
                )}
                {type === 'orb' && <option value="drop_rates">Drop Rates Array</option>}
                {type === 'character' && (
                  <>
                    <option value="rankings">Rankings Array</option>
                    <option value="orbs_used">Orbs Used Array</option>
                    <option value="stats">Stats Array</option>
                  </>
                )}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold', color: 'var(--text-muted)' }}>Section to Edit</label>
              <select disabled style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
                <option>-- Select a record first --</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {selectedSlug && entity && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          {!isArray ? (
            <DynamicForm 
              schema={schema} 
              initialData={{ ...entity }} 
              actionName="Edit Base Details"
              onSave={handleSaveForm}
              onCancel={() => { setSelectedSlug(''); resetFlow(); }}
            />
          ) : viewState === 'list' ? (
            <ListView 
              items={items} 
              summaryFn={getSummary}
              onAdd={() => { setEditAction('add'); setActiveItem({}); setViewState('form'); }}
              onEdit={(item) => { setEditAction('edit'); setActiveItem(item); setViewState('form'); }}
              onCopy={(item) => { setEditAction('copy'); setActiveItem(item); setViewState('form'); }}
              onDelete={handleDelete}
            />
          ) : (
            <DynamicForm 
              schema={schema} 
              initialData={prepareTimelineData(activeItem)} 
              actionName={editAction === 'add' ? 'Create New Entry' : editAction === 'copy' ? 'Create Copy from Entry' : 'Edit Entry'}
              onSave={handleSaveForm}
              onCancel={() => setViewState('list')}
            />
          )}
        </div>
      )}
    </div>
  );
}
