import { useState, useEffect } from 'preact/hooks';
import { createClient } from '@supabase/supabase-js';
import { WHITELISTED_DOMAINS_DEFAULTS } from '@hatchling/shared';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function Options() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [threshold, setThreshold] = useState(5000); // cents
  const [incubationDays, setIncubationDays] = useState(14);
  const [cooldownCount, setCooldownCount] = useState(3);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [domains, setDomains] = useState<string[]>(WHITELISTED_DOMAINS_DEFAULTS);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setThreshold(profile.spending_threshold);
      setIncubationDays(profile.incubation_days);
      setCooldownCount(profile.cooldown_purchase_count);
      setCooldownHours(profile.cooldown_window_hours);
      setDomains(profile.whitelisted_domains.length > 0 ? profile.whitelisted_domains : WHITELISTED_DOMAINS_DEFAULTS);
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('profiles').update({
      spending_threshold: threshold,
      incubation_days: incubationDays,
      cooldown_purchase_count: cooldownCount,
      cooldown_window_hours: cooldownHours,
      whitelisted_domains: domains,
    }).eq('id', session.user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addDomain() {
    const d = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (d && !domains.includes(d)) {
      setDomains([...domains, d]);
      setNewDomain('');
    }
  }

  function removeDomain(domain: string) {
    setDomains(domains.filter(d => d !== domain));
  }

  const inputStyle = {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '9px',
    padding: '8px',
    border: '2px solid #333',
    background: '#fff',
    width: '100%',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '8px',
    color: '#666',
  };

  const sectionStyle = {
    background: '#fff',
    border: '3px solid #333',
    boxShadow: '4px 4px 0 #333',
    padding: '16px',
    marginBottom: '16px',
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '32px' }}>Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <h1 style={{ fontSize: '16px', marginBottom: '16px' }}>🐣 Hatchling Settings</h1>
        <p style={{ marginBottom: '16px' }}>Please log in to the Hatchling web app first.</p>
        <button
          onClick={() => chrome.tabs.create({ url: 'http://localhost:5173/login' })}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', padding: '12px 24px',
            background: '#78c850', color: '#fff', border: '3px solid #333',
            boxShadow: '4px 4px 0 #333', cursor: 'pointer',
          }}
        >
          Go to Hatchling
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '16px', marginBottom: '24px' }}>🐣 Hatchling Settings</h1>

      {/* Spending Threshold */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Spending Threshold: ${(threshold / 100).toFixed(0)}</label>
        <input
          type="range"
          min="1000" max="50000" step="500"
          value={threshold}
          onInput={(e) => setThreshold(Number((e.target as HTMLInputElement).value))}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: '#888' }}>
          <span>$10</span><span>$500</span>
        </div>
        <p style={{ fontSize: '7px', color: '#888', marginTop: '8px' }}>
          Hatchling will prompt you when adding items above this price to cart.
        </p>
      </div>

      {/* Incubation Period */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Incubation Period: {incubationDays} days</label>
        <input
          type="range"
          min="7" max="30" step="1"
          value={incubationDays}
          onInput={(e) => setIncubationDays(Number((e.target as HTMLInputElement).value))}
          style={{ width: '100%', marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: '#888' }}>
          <span>7 days</span><span>30 days</span>
        </div>
      </div>

      {/* Cooldown Settings */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Cooldown: trigger after {cooldownCount} purchases in {cooldownHours} hours</label>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ ...labelStyle, fontSize: '7px' }}>Purchases</label>
            <input
              type="number" min="1" max="10"
              value={cooldownCount}
              onInput={(e) => setCooldownCount(Number((e.target as HTMLInputElement).value))}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...labelStyle, fontSize: '7px' }}>Hours</label>
            <input
              type="number" min="1" max="72"
              value={cooldownHours}
              onInput={(e) => setCooldownHours(Number((e.target as HTMLInputElement).value))}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Whitelisted Domains */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Whitelisted Domains (never prompt on these sites)</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="example.com"
            value={newDomain}
            onInput={(e) => setNewDomain((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addDomain(); }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={addDomain}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px', padding: '8px 12px',
              background: '#78c850', color: '#fff', border: '2px solid #333',
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {domains.map(domain => (
            <div key={domain} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 8px', borderBottom: '1px solid #eee',
            }}>
              <span>{domain}</span>
              <button
                onClick={() => removeDomain(domain)}
                style={{
                  background: 'none', border: 'none', color: '#f85888',
                  cursor: 'pointer', fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={saveSettings}
        disabled={saving}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '11px', padding: '14px 24px',
          background: saving ? '#ccc' : '#78c850',
          color: '#fff', border: '3px solid #333',
          boxShadow: '4px 4px 0 #333', cursor: saving ? 'default' : 'pointer',
          width: '100%', textShadow: '1px 1px 0 #333',
        }}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
