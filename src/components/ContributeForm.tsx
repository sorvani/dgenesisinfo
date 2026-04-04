"use client";

import { useState } from 'react';
import { type Orb, type Explorer } from '@/lib/data';

interface Props {
  orbs: Orb[];
  explorers: Explorer[];
}

// ─── Dynamic Form Engine Definitions ─────────────────────────────────────

type FieldType = 'text' | 'number' | 'textarea' | 'date';
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

const explorerBaseSchema: FieldDef[] = [
  { key: 'slug', label: 'Slug (ID)', type: 'text', required: true },
  { key: 'first_name', label: 'First Name', type: 'text' },
  { key: 'last_name', label: 'Last Name', type: 'text' },
  { key: 'moniker', label: 'Moniker', type: 'text' },
  { key: 'nationality', label: 'Nationality (e.g. JP, US)', type: 'text' },
  { key: 'date_first_known', label: 'Date First Known', type: 'date' },
  { key: 'public', label: 'Public Level (Number)', type: 'number' },
  { key: 'birthday', label: 'Birthday', type: 'text' },
  { key: 'sex', label: 'Sex', type: 'text' }
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
  { key: 'points_from_average', label: 'Points from Average', type: 'number' },
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

const setVal = (obj: any, key: string, val: string | number | null) => {
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

          return (
            <div key={field.key} style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: 'var(--space-xs)' }}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea value={val as string} onChange={onChange} rows={3} required={field.required} style={inputStyle} />
              ) : field.type === 'number' ? (
                <input type="number" step="any" value={val as number|string} onChange={onChange} required={field.required} style={inputStyle} />
              ) : field.type === 'date' ? (
                <input type="date" value={val as string} onChange={onChange} required={field.required} style={inputStyle} />
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

export function ContributeForm({ orbs, explorers }: Props) {
  const [type, setType] = useState<'orb' | 'explorer'>('orb');
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
    setType(e.target.value as 'orb' | 'explorer');
    setSelectedSlug('');
    setSection('base');
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
    if (type === 'orb') {
      entity = orbs.find(o => o.slug === selectedSlug);
      if (section === 'base') {
        schema = orbBaseSchema;
      } else if (section === 'drop_rates') {
        schema = dropRateSchema; items = entity?.drop_rates || []; isArray = true; sectionName = "Drop Rates";
      }
    } else {
      entity = explorers.find(ex => ex.slug === selectedSlug);
      if (section === 'base') {
        schema = explorerBaseSchema;
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
    return JSON.stringify(item).substring(0, 50)+'...';
  };

  const executeGitHubRedirect = (actionType: string, payloadStr: string) => {
    const target = `${type === 'orb' ? 'Orb' : 'Explorer'} (${selectedSlug}) -> ${sectionName}`;
    const title = `Update ${type === 'orb' ? 'Orb' : 'Explorer'}: ${selectedSlug}`;
    const body = `### Proposed Contribution\n**Action:** \`${actionType}\`\n**Target:** \`${target}\`\n\n**Payload:**\n\`\`\`json\n${payloadStr}\n\`\`\`\n`;
    const url = `https://github.com/sorvani/dgenesisinfo/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const handleSaveForm = (data: any) => {
    executeGitHubRedirect(editAction.toUpperCase(), JSON.stringify(data, null, 2));
    if (isArray) setViewState('list');
  };

  const handleDelete = (item: any) => {
    if (window.confirm("Are you sure you want to propose deleting this entry?")) {
      executeGitHubRedirect('DELETE', JSON.stringify(item, null, 2));
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: selectedSlug ? '1fr 2fr 1.5fr' : '1fr 2fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Record Type</label>
          <select value={type} onChange={handleTypeSelect} style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="orb">Skill Orb</option>
            <option value="explorer">Explorer</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Select Record</label>
          <select value={selectedSlug} onChange={handleEntitySelect} style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="">-- Choose a record to edit --</option>
            {type === 'orb' 
              ? orbs.map(o => <option key={o.slug} value={o.slug}>{o.orb_name || o.slug}</option>)
              : explorers.map(e => <option key={e.slug} value={e.slug}>{e.first_name} {e.last_name || ''} ({e.slug})</option>)
            }
          </select>
        </div>

        {selectedSlug && (
          <div className="animate-in">
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Section to Edit</label>
            <select value={section} onChange={handleSectionSelect} style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              <option value="base">Base Details</option>
              {type === 'orb' ? (
                <option value="drop_rates">Drop Rates Array</option>
              ) : (
                <>
                  <option value="rankings">Rankings Array</option>
                  <option value="orbs_used">Orbs Used Array</option>
                  <option value="stats">Stats Array</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {selectedSlug && entity && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          {!isArray ? (
            <DynamicForm 
              schema={schema} 
              initialData={{ ...entity }} 
              actionName="Edit Base Details"
              onSave={handleSaveForm}
              onCancel={() => {}}
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
              initialData={activeItem} 
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
