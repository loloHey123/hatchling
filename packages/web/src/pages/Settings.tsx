import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { AnimatedPage } from '../components/AnimatedPage';
import { WHITELISTED_DOMAINS_DEFAULTS, PALETTES } from '@hatchling/shared';
import { useTheme } from '../hooks/useTheme';

export function Settings() {
  const { user } = useAuth();
  const { paletteId, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState('Trainer');
  const [threshold, setThreshold] = useState(5000);
  const [incubationDays, setIncubationDays] = useState(14);
  const [cooldownCount, setCooldownCount] = useState(3);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [domains, setDomains] = useState<string[]>(WHITELISTED_DOMAINS_DEFAULTS);
  const [newDomain, setNewDomain] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [shareSlug, setShareSlug] = useState('');

  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);

  async function loadSettings() {
    if (!user) return;
    const [profileRes, shareRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('share_profiles').select('*').eq('user_id', user.id).single(),
    ]);

    if (profileRes.data) {
      setDisplayName(profileRes.data.display_name);
      setThreshold(profileRes.data.spending_threshold);
      setIncubationDays(profileRes.data.incubation_days);
      setCooldownCount(profileRes.data.cooldown_purchase_count);
      setCooldownHours(profileRes.data.cooldown_window_hours);
      setDebugMode(profileRes.data.debug_mode ?? false);
      setDomains(
        profileRes.data.whitelisted_domains.length > 0
          ? profileRes.data.whitelisted_domains
          : WHITELISTED_DOMAINS_DEFAULTS
      );
    }
    if (shareRes.data) {
      setIsPublic(shareRes.data.is_public);
      setShareSlug(shareRes.data.share_slug);
    }
    setLoading(false);
  }

  async function saveSettings() {
    if (!user) return;
    setSaving(true);

    await Promise.all([
      supabase
        .from('profiles')
        .update({
          display_name: displayName,
          spending_threshold: threshold,
          incubation_days: incubationDays,
          cooldown_purchase_count: cooldownCount,
          cooldown_window_hours: cooldownHours,
          whitelisted_domains: domains,
          debug_mode: debugMode,
        })
        .eq('id', user.id),
      supabase
        .from('share_profiles')
        .update({ is_public: isPublic })
        .eq('user_id', user.id),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addDomain() {
    const d = newDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');
    if (d && !domains.includes(d)) {
      setDomains([...domains, d]);
      setNewDomain('');
    }
  }

  function removeDomain(domain: string) {
    setDomains(domains.filter((d) => d !== domain));
  }

  const inputClass =
    'w-full border-2 border-theme-border font-body text-sm px-3 py-2 bg-theme-bg rounded-button focus:outline-none focus:border-theme-accent transition-colors';

  if (loading) {
    return (
      <AnimatedPage className="space-y-5">
        <h2 className="text-pixel-xl font-pixel">Settings</h2>
        <PixelFrame className="text-center">
          <p className="text-sm text-theme-text-muted font-body">Loading settings...</p>
        </PixelFrame>
      </AnimatedPage>
    );
  }

  const shareUrl = shareSlug ? `${window.location.origin}/share/${shareSlug}` : '';

  return (
    <AnimatedPage className="space-y-5">
      <h2 className="text-pixel-xl font-pixel">Settings</h2>

      {/* Theme */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-3">Theme</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PALETTES.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => setTheme(p.id)}
              className={`p-3 border-2 rounded-card transition-all cursor-pointer ${
                paletteId === p.id
                  ? 'border-theme-accent shadow-soft-md'
                  : 'border-theme-border hover:border-theme-text-muted'
              }`}
              style={{ backgroundColor: p.colors.surface }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex gap-1 mb-2 justify-center">
                {[p.colors.bg, p.colors.surface, p.colors.accent, p.colors.accentSecondary, p.colors.text].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>
              <div className="font-body text-xs text-center font-semibold" style={{ color: p.colors.text }}>
                {p.name}
              </div>
            </motion.button>
          ))}
        </div>
      </PixelFrame>

      {/* Display Name */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-2">Display Name</h3>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
          placeholder="Trainer"
          maxLength={30}
        />
        <p className="text-xs text-theme-text-muted mt-1 font-body">Your public trainer name.</p>
      </PixelFrame>

      {/* Spending Threshold */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-2">Spending Threshold</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1000}
            max={50000}
            step={500}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-[var(--color-accent)]"
          />
          <span className="text-lg font-bold font-body min-w-[60px] text-right">
            ${(threshold / 100).toFixed(0)}
          </span>
        </div>
        <p className="text-xs text-theme-text-muted mt-1 font-body">
          Purchases above this amount ($10 - $500) will trigger an intervention.
        </p>
      </PixelFrame>

      {/* Incubation Period */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-2">Incubation Period</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={7}
            max={30}
            step={1}
            value={incubationDays}
            onChange={(e) => setIncubationDays(Number(e.target.value))}
            className="flex-1 accent-[var(--color-accent)]"
          />
          <span className="text-lg font-bold font-body min-w-[80px] text-right">
            {incubationDays} days
          </span>
        </div>
        <p className="text-xs text-theme-text-muted mt-1 font-body">
          How long eggs must incubate before they can hatch (7-30 days).
        </p>
      </PixelFrame>

      {/* Whitelisted Domains */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-2">Whitelisted Domains</h3>
        <p className="text-xs text-theme-text-muted mb-3 font-body">
          The extension will only activate on these shopping sites.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDomain()}
            className={`${inputClass} flex-1`}
            placeholder="example.com"
          />
          <PixelButton size="sm" onClick={addDomain}>Add</PixelButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1.5 bg-theme-bg border-2 border-theme-border px-2.5 py-1 text-xs font-body rounded-button"
            >
              {domain}
              <button
                onClick={() => removeDomain(domain)}
                className="text-theme-danger hover:text-theme-text font-bold cursor-pointer bg-transparent border-none ml-0.5"
                title={`Remove ${domain}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      </PixelFrame>

      {/* Share Profile */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-2">Share Profile</h3>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-[44px] h-[24px] border-2 border-theme-border rounded-full cursor-pointer transition-colors ${
              isPublic ? 'bg-theme-accent' : 'bg-theme-border'
            }`}
          >
            <motion.span
              className="absolute top-[2px] w-[16px] h-[16px] bg-theme-surface border-[1px] border-theme-border rounded-full"
              animate={{ left: isPublic ? '22px' : '2px' }}
              transition={{ duration: 0.2 }}
            />
          </button>
          <span className="text-sm font-body">{isPublic ? 'Public' : 'Private'}</span>
        </div>
        {isPublic && shareUrl && (
          <div>
            <label className="text-xs text-theme-text-muted block mb-1 font-body">Your share URL</label>
            <div className="flex gap-2 items-center">
              <input type="text" readOnly value={shareUrl} className={`${inputClass} flex-1 bg-theme-bg text-theme-text-muted`} />
              <PixelButton size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                Copy
              </PixelButton>
            </div>
          </div>
        )}
        <p className="text-xs text-theme-text-muted mt-2 font-body">
          {isPublic ? 'Others can view your collection and stats.' : 'Your profile is hidden from others.'}
        </p>
      </PixelFrame>

      {/* Extension */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-2">Chrome Extension</h3>
        <p className="text-sm font-body mb-3">
          The Hatchling browser extension detects impulse purchases and helps you resist them.
        </p>
        <ol className="text-sm text-theme-text-muted font-body space-y-1 list-decimal list-inside mb-3">
          <li>Download or clone the extension from the project repo</li>
          <li>Open <span className="font-bold text-theme-text">chrome://extensions</span> in your browser</li>
          <li>Enable <span className="font-bold text-theme-text">Developer mode</span> (top right)</li>
          <li>Click <span className="font-bold text-theme-text">Load unpacked</span> and select the extension folder</li>
          <li>Sign in with the same account you use here</li>
        </ol>
      </PixelFrame>

      {/* Debug Mode */}
      <PixelFrame className="border-theme-danger/30">
        <h3 className="text-sm font-bold font-body mb-2 text-theme-danger">Debug Mode</h3>
        <p className="text-xs text-theme-text-muted mb-3 font-body">
          Eggs incubate in 10 minutes instead of days. For testing only.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`relative w-[44px] h-[24px] rounded-full border-2 border-theme-border transition-colors cursor-pointer ${
              debugMode ? 'bg-theme-danger' : 'bg-theme-border'
            }`}
          >
            <motion.div
              className="absolute top-[2px] w-[16px] h-[16px] bg-theme-surface border border-theme-border rounded-full"
              animate={{ left: debugMode ? '22px' : '2px' }}
              transition={{ duration: 0.2 }}
            />
          </button>
          <span className="text-sm font-body">{debugMode ? 'ON — 10min incubation' : 'OFF — Normal incubation'}</span>
        </label>
      </PixelFrame>

      {/* Save */}
      <div className="flex items-center gap-4">
        <PixelButton onClick={saveSettings} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Settings'}
        </PixelButton>
        {saved && (
          <motion.span
            className="text-sm text-theme-success font-bold font-body"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Settings saved!
          </motion.span>
        )}
      </div>
    </AnimatedPage>
  );
}
