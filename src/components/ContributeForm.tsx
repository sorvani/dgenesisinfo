"use client";

import { useState } from 'react';
import { type Orb, type Explorer } from '@/lib/data';

interface Props {
  orbs: Orb[];
  explorers: Explorer[];
}

export function ContributeForm({ orbs, explorers }: Props) {
  const [type, setType] = useState<'orb' | 'explorer'>('orb');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [formData, setFormData] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as 'orb' | 'explorer');
    setSelectedSlug('');
    setFormData('');
    setJsonError(null);
  };

  const handleEntitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelectedSlug(slug);
    setJsonError(null);
    if (!slug) {
      setFormData('');
      return;
    }
    
    let entity;
    if (type === 'orb') {
      entity = orbs.find(o => o.slug === slug);
    } else {
      entity = explorers.find(ex => ex.slug === slug);
    }

    if (entity) {
      setFormData(JSON.stringify(entity, null, 2));
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(e.target.value);
    setJsonError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    // Validate JSON strictly before allowing submission
    try {
      JSON.parse(formData);
      setJsonError(null);
    } catch (err: any) {
      setJsonError("Invalid JSON syntax: " + err.message);
      return;
    }
    
    const entityTypeStr = type === 'orb' ? 'Orb' : 'Explorer';
    const title = `Update ${entityTypeStr}: ${selectedSlug}`;
    const body = `### Proposed Edit for ${selectedSlug}\n\nPlease review and apply the following JSON changes:\n\n\`\`\`json\n${formData}\n\`\`\`\n`;
    
    const url = `https://github.com/sorvani/dgenesisinfo/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const currentList = type === 'orb' ? orbs : explorers;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Record Type</label>
          <select 
            value={type} 
            onChange={handleTypeSelect}
            style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            <option value="orb">Skill Orb</option>
            <option value="explorer">Explorer</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>Select Record</label>
          <select 
            value={selectedSlug} 
            onChange={handleEntitySelect}
            style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            <option value="">-- Choose a record to branch --</option>
            {type === 'orb' 
              ? orbs.map(o => <option key={o.slug} value={o.slug}>{o.orb_name || o.slug}</option>)
              : explorers.map(e => <option key={e.slug} value={e.slug}>{e.first_name} {e.last_name} ({e.slug})</option>)
            }
          </select>
        </div>
      </div>

      {selectedSlug && (
        <form onSubmit={handleSubmit} className="animate-in">
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>JSON Data Editor</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>
              Modify the raw data object below. You must maintain valid JSON syntax. New lines and fields are perfectly fine.
            </p>
            <textarea 
              value={formData}
              onChange={handleJsonChange}
              rows={25}
              style={{ 
                width: '100%', 
                padding: 'var(--space-md)', 
                borderRadius: 'var(--radius-md)', 
                border: jsonError ? '1px solid var(--accent-red)' : '1px solid var(--border-subtle)', 
                background: 'var(--bg-primary)', 
                color: 'var(--text-primary)', 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}
              spellCheck={false}
            />
            {jsonError && (
              <div style={{ color: 'var(--accent-red)', marginTop: 'var(--space-xs)', fontSize: '0.875rem', fontWeight: 'bold' }}>
                {jsonError}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            style={{ 
              width: '100%',
              padding: 'var(--space-md)', 
              background: 'var(--accent-teal)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'opacity var(--transition-base)'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Submit Proposed Edit to GitHub
          </button>
        </form>
      )}
    </div>
  );
}
