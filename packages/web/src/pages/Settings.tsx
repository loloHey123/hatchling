import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { WHITELISTED_DOMAINS_DEFAULTS } from '@hatchling/shared';

export function Settings() {
  const { user } = useAuth();
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
    'w-full border-2 border-[#333] font-pixel text-[10px] px-3 py-2 bg-white focus:outline-none focus:border-[#78c850]';

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-[16px]">Settings</h2>
        <PixelFrame className="text-center">
          <p className="text-[10px] text-[#888]">Loading settings...</p>
        </PixelFrame>
      </div>
    );
  }

  const shareUrl = shareSlug
    ? `${window.location.origin}/share/${shareSlug}`
    : '';

  return (
    <div className="space-y-6">
      <h2 className="text-[16px]">Settings</h2>

      {/* Display Name */}
      <PixelFrame>
        <h3 className="text-[11px] mb-3">Display Name</h3>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
          placeholder="Trainer"
          maxLength={30}
        />
        <p className="text-[7px] text-[#888] mt-1">
          Your public trainer name.
        </p>
      </PixelFrame>

      {/* Spending Threshold */}
      <PixelFrame>
        <h3 className="text-[11px] mb-3">Spending Threshold</h3>
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
          <span className="text-[12px] font-bold min-w-[60px] text-right">
            ${(threshold / 100).toFixed(0)}
          </span>
        </div>
        <p className="text-[7px] text-[#888] mt-1">
          Purchases above this amount ($10 - $500) will trigger an intervention.
        </p>
      </PixelFrame>

      {/* Incubation Period */}
      <PixelFrame>
        <h3 className="text-[11px] mb-3">Incubation Period</h3>
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
          <span className="text-[12px] font-bold min-w-[60px] text-right">
            {incubationDays} days
          </span>
        </div>
        <p className="text-[7px] text-[#888] mt-1">
          How long eggs must incubate before they can hatch (7-30 days).
        </p>
      </PixelFrame>

      {/* Cooldown Settings */}
      <PixelFrame>
        <h3 className="text-[11px] mb-3">Cooldown Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[8px] text-[#666] block mb-1">
              Purchase Count (1-10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={cooldownCount}
                onChange={(e) => setCooldownCount(Number(e.target.value))}
                className="flex-1 accent-[#78c850]"
              />
              <span className="text-[12px] font-bold min-w-[40px] text-right">
                {cooldownCount}
              </span>
            </div>
          </div>
          <div>
            <label className="text-[8px] text-[#666] block mb-1">
              Window Hours (1-72)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={72}
                step={1}
                value={cooldownHours}
                onChange={(e) => setCooldownHours(Number(e.target.value))}
                className="flex-1 accent-[#78c850]"
              />
              <span className="text-[12px] font-bold min-w-[40px] text-right">
                {cooldownHours}h
              </span>
            </div>
          </div>
        </div>
        <p className="text-[7px] text-[#888] mt-2">
          After {cooldownCount} resisted purchase{cooldownCount > 1 ? 's' : ''}{' '}
          within {cooldownHours} hour{cooldownHours > 1 ? 's' : ''}, you enter a
          cooldown period.
        </p>
      </PixelFrame>

      {/* Whitelisted Domains */}
      <PixelFrame>
        <h3 className="text-[11px] mb-3">Whitelisted Domains</h3>
        <p className="text-[7px] text-[#888] mb-3">
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
              className="inline-flex items-center gap-1 bg-[#f0f0f0] border-2 border-[#333] px-2 py-1 text-[8px] font-pixel"
            >
              {domain}
              <button
                onClick={() => removeDomain(domain)}
                className="text-[#f85888] hover:text-[#ff6898] font-bold cursor-pointer ml-1"
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
        <h3 className="text-[11px] mb-3">Share Profile</h3>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-[40px] h-[20px] border-2 border-[#333] cursor-pointer transition-colors ${
              isPublic ? 'bg-[#78c850]' : 'bg-[#ccc]'
            }`}
          >
            <span
              className={`absolute top-[1px] w-[14px] h-[14px] bg-white border-[1px] border-[#333] transition-all ${
                isPublic ? 'left-[21px]' : 'left-[1px]'
              }`}
            />
          </button>
          <span className="text-[9px]">
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        {isPublic && shareUrl && (
          <div>
            <label className="text-[8px] text-[#666] block mb-1">
              Your share URL
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className={`${inputClass} flex-1 bg-[#f8f8f8] text-[#666]`}
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
        <p className="text-[7px] text-[#888] mt-2">
          {isPublic
            ? 'Others can view your collection and stats.'
            : 'Your profile is hidden from others.'}
        </p>
      </PixelFrame>

      {/* Extension */}
      <PixelFrame>
        <h3 className="text-[11px] mb-3">Chrome Extension</h3>
        <p className="text-[9px] mb-3">
          The Hatchling browser extension detects impulse purchases and helps you
          resist them.
        </p>
        <ol className="text-[8px] text-[#666] space-y-1 list-decimal list-inside mb-3">
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

      {/* Save */}
      <div className="flex items-center gap-4">
        <PixelButton onClick={saveSettings} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Settings'}
        </PixelButton>
        {saved && (
          <span className="text-[10px] text-[#78c850] font-pixel">
            Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}
