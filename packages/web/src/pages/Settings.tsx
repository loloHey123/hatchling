import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { WHITELISTED_DOMAINS_DEFAULTS, PALETTES } from '@hatchling/shared';
import { useTheme } from '../hooks/useTheme';

export function Settings() {
  const { user } = useAuth();
  const { paletteId, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState('Trainer');
  const [threshold, setThreshold] = useState(5000);
  const [incubationDays, setIncubationDays] = useState(14);
  const [cooldownCount, setCooldownCount] = useState(3);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [domains, setDomains] = useState<string[]>(WHITELISTED_DOMAINS_DEFAULTS);
  const [newDomain, setNewDomain] = useState('');

  // Debug
  const [debugMode, setDebugMode] = useState(false);

  // Share profile
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
        .update({
          is_public: isPublic,
        })
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
    'w-full border-2 border-theme-border font-pixel text-pixel-base px-3 py-2 bg-theme-surface focus:outline-none focus:border-theme-accent';

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-pixel-xl">Settings</h2>
        <PixelFrame className="text-center">
          <p className="text-pixel-base text-theme-text-muted">Loading settings...</p>
        </PixelFrame>
      </div>
    );
  }

  const shareUrl = shareSlug
    ? `${window.location.origin}/share/${shareSlug}`
    : '';

  return (
    <div className="space-y-6">
      <h2 className="text-pixel-xl">Settings</h2>

      {/* Theme */}
      <PixelFrame className="mb-6">
        <h3 className="font-pixel text-pixel-base text-theme-text mb-4">Theme</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setTheme(p.id)}
              className={`p-3 border-2 transition-all cursor-pointer ${
                paletteId === p.id
                  ? 'border-theme-accent shadow-pixel-sm'
                  : 'border-theme-border hover:border-theme-text-muted'
              }`}
              style={{ backgroundColor: p.colors.surface }}
            >
              <div className="flex gap-1 mb-2 justify-center">
                {[p.colors.bg, p.colors.surface, p.colors.accent, p.colors.accentSecondary, p.colors.text].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 border border-black/20"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>
              <div className="font-pixel text-pixel-xs text-center" style={{ color: p.colors.text }}>
                {p.name}
              </div>
            </button>
          ))}
        </div>
      </PixelFrame>

      {/* Display Name */}
      <PixelFrame>
        <h3 className="text-pixel-base mb-3">Display Name</h3>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
          placeholder="Trainer"
          maxLength={30}
        />
        <p className="text-pixel-xs text-theme-text-muted mt-1">
          Your public trainer name.
        </p>
      </PixelFrame>

      {/* Spending Threshold */}
      <PixelFrame>
        <h3 className="text-pixel-base mb-3">Spending Threshold</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1000}
            max={50000}
            step={500}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-[#78c850]"
          />
          <span className="text-pixel-lg font-bold min-w-[60px] text-right">
            ${(threshold / 100).toFixed(0)}
          </span>
        </div>
        <p className="text-pixel-xs text-theme-text-muted mt-1">
          Purchases above this amount ($10 - $500) will trigger an intervention.
        </p>
      </PixelFrame>

      {/* Incubation Period */}
      <PixelFrame>
        <h3 className="text-pixel-base mb-3">Incubation Period</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={7}
            max={30}
            step={1}
            value={incubationDays}
            onChange={(e) => setIncubationDays(Number(e.target.value))}
            className="flex-1 accent-[#78c850]"
          />
          <span className="text-pixel-lg font-bold min-w-[60px] text-right">
            {incubationDays} days
          </span>
        </div>
        <p className="text-pixel-xs text-theme-text-muted mt-1">
          How long eggs must incubate before they can hatch (7-30 days).
        </p>
      </PixelFrame>

      {/* Cooldown Settings - hidden for MVP, not yet wired up */}

      {/* Whitelisted Domains */}
      <PixelFrame>
        <h3 className="text-pixel-base mb-3">Whitelisted Domains</h3>
        <p className="text-pixel-xs text-theme-text-muted mb-3">
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
          <PixelButton size="sm" onClick={addDomain}>
            Add
          </PixelButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1 bg-theme-bg border-2 border-theme-border px-2 py-1 text-pixel-sm font-pixel"
            >
              {domain}
              <button
                onClick={() => removeDomain(domain)}
                className="text-theme-danger hover:text-theme-text font-bold cursor-pointer ml-1"
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
        <h3 className="text-pixel-base mb-3">Share Profile</h3>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-[40px] h-[20px] border-2 border-theme-border cursor-pointer transition-colors ${
              isPublic ? 'bg-theme-accent' : 'bg-theme-border'
            }`}
          >
            <span
              className={`absolute top-[1px] w-[14px] h-[14px] bg-theme-surface border-[1px] border-theme-border transition-all ${
                isPublic ? 'left-[21px]' : 'left-[1px]'
              }`}
            />
          </button>
          <span className="text-pixel-sm">
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        {isPublic && shareUrl && (
          <div>
            <label className="text-pixel-sm text-theme-text-muted block mb-1">
              Your share URL
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className={`${inputClass} flex-1 bg-theme-bg text-theme-text-muted`}
              />
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                Copy
              </PixelButton>
            </div>
          </div>
        )}
        <p className="text-pixel-xs text-theme-text-muted mt-2">
          {isPublic
            ? 'Others can view your collection and stats.'
            : 'Your profile is hidden from others.'}
        </p>
      </PixelFrame>

      {/* Extension */}
      <PixelFrame>
        <h3 className="text-pixel-base mb-3">Chrome Extension</h3>
        <p className="text-pixel-sm mb-3">
          The Hatchling browser extension detects impulse purchases and helps you
          resist them.
        </p>
        <ol className="text-pixel-sm text-theme-text-muted space-y-1 list-decimal list-inside mb-3">
          <li>Download or clone the extension from the project repo</li>
          <li>
            Open <span className="font-bold">chrome://extensions</span> in your
            browser
          </li>
          <li>
            Enable <span className="font-bold">Developer mode</span> (top
            right)
          </li>
          <li>
            Click <span className="font-bold">Load unpacked</span> and select
            the extension folder
          </li>
          <li>Sign in with the same account you use here</li>
        </ol>
        <PixelButton
          size="sm"
          variant="secondary"
          onClick={() =>
            window.open(
              'https://github.com/your-repo/hatchling-ext',
              '_blank'
            )
          }
        >
          View Extension Repo
        </PixelButton>
      </PixelFrame>

      {/* Debug Mode */}
      <PixelFrame className="border-theme-danger">
        <h3 className="text-pixel-base mb-2 text-theme-danger">🐛 Debug Mode</h3>
        <p className="text-pixel-sm text-theme-text-muted mb-3">
          Eggs incubate in 10 minutes instead of days. For testing only.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setDebugMode(!debugMode)}
            className={`w-10 h-5 rounded-full border-2 border-theme-border relative transition-colors cursor-pointer ${
              debugMode ? 'bg-theme-danger' : 'bg-theme-border'
            }`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 bg-theme-surface border border-theme-border rounded-full transition-all ${
                debugMode ? 'left-5' : 'left-0.5'
              }`}
            />
          </div>
          <span className="text-pixel-sm">{debugMode ? 'ON — 10min incubation' : 'OFF — Normal incubation'}</span>
        </label>
      </PixelFrame>

      {/* Save */}
      <div className="flex items-center gap-4">
        <PixelButton onClick={saveSettings} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Settings'}
        </PixelButton>
        {saved && (
          <span className="text-pixel-base text-theme-accent font-pixel">
            Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}
