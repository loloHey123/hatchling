import { useState, useEffect } from 'preact/hooks';
import { getPalette, DEFAULT_PALETTE_ID, RARITY_COLORS } from '@hatchling/shared';
import type { ThemePalette } from '@hatchling/shared';

interface StatusData {
  isLoggedIn: boolean;
  eggs?: Array<{
    id: string;
    source_product_name: string;
    incubation_end: string;
    rarity: number;
  }>;
  tokenCount?: number;
  totalSaved?: number;
  webAppUrl?: string;
}

function LoginForm({ onLogin, theme }: { onLogin: () => void; theme: ThemePalette['colors'] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    chrome.runtime.sendMessage(
      { type: 'SIGN_IN', payload: { email, password } },
      (response: { success: boolean; error?: string }) => {
        setLoading(false);
        if (response?.success) {
          onLogin();
        } else {
          setError(response?.error || 'Login failed');
        }
      }
    );
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: `2px solid ${theme.border}`,
    fontSize: '10px',
    fontFamily: "'Press Start 2P', monospace",
    boxSizing: 'border-box' as const,
    background: theme.surface,
    color: theme.text,
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '32px' }}>🐣</div>
        <h2 style={{ fontSize: '12px' }}>Hatchling</h2>
        <p style={{ fontSize: '7px', color: theme.textMuted }}>Log in to start earning tokens</p>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          style={inputStyle}
          required
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          style={inputStyle}
          required
        />
      </div>
      {error && (
        <div style={{ color: theme.danger, fontSize: '7px', marginBottom: '8px' }}>{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '9px',
          padding: '10px',
          background: loading ? theme.textMuted : theme.success,
          color: theme.text,
          border: `2px solid ${theme.border}`,
          boxShadow: `3px 3px 0 ${theme.border}`,
          cursor: loading ? 'default' : 'pointer',
          textShadow: `1px 1px 0 ${theme.border}`,
        }}
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}

export function Popup() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);

  useEffect(() => {
    chrome.storage.local.get('hatchling_palette', (result: Record<string, string>) => {
      if (result.hatchling_palette) setPaletteId(result.hatchling_palette);
    });
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response: StatusData) => {
      setStatus(response);
      setLoading(false);
    });
  }, []);

  const theme = getPalette(paletteId).colors;

  const rootStyle = {
    backgroundColor: theme.bg,
    color: theme.text,
    fontFamily: "'Press Start 2P', monospace",
    minHeight: '100%',
  };

  if (loading) {
    return (
      <div style={{ ...rootStyle, padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🥚</div>
        <div>Loading...</div>
      </div>
    );
  }

  if (!status?.isLoggedIn) {
    return (
      <div style={rootStyle}>
        <LoginForm onLogin={() => {
          setLoading(true);
          chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response: StatusData) => {
            setStatus(response);
            setLoading(false);
          });
        }} theme={theme} />
      </div>
    );
  }

  const webAppUrl = status.webAppUrl || 'http://localhost:5173';
  const eggs = status.eggs || [];

  const getDaysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Ready!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div style={{ ...rootStyle, padding: '16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>🐣</span>
        <h2 style={{ fontSize: '12px', marginTop: '4px' }}>Hatchling</h2>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>🪙</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{status.tokenCount || 0}</div>
          <div style={{ fontSize: '6px', color: theme.textMuted }}>tokens</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>💰</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.success }}>
            ${((status.totalSaved || 0) / 100).toFixed(0)}
          </div>
          <div style={{ fontSize: '6px', color: theme.textMuted }}>saved</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>🥚</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{eggs.length}</div>
          <div style={{ fontSize: '6px', color: theme.textMuted }}>eggs</div>
        </div>
      </div>

      {/* Active eggs */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '8px', marginBottom: '8px' }}>Active Eggs</h3>
        {eggs.length === 0 ? (
          <div style={{
            background: theme.surface, border: `2px solid ${theme.border}`, padding: '12px',
            textAlign: 'center', color: theme.textMuted, fontSize: '7px',
          }}>
            No eggs incubating.
            <br />Resist a purchase to earn a token!
          </div>
        ) : (
          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {eggs.slice(0, 5).map((egg) => {
              const remaining = getDaysRemaining(egg.incubation_end);
              const isReady = remaining === 'Ready!';
              return (
                <div
                  key={egg.id}
                  style={{
                    background: theme.surface,
                    border: `2px solid ${theme.border}`,
                    padding: '8px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{
                    width: '24px', height: '28px',
                    background: RARITY_COLORS[egg.rarity as keyof typeof RARITY_COLORS] || theme.textMuted,
                    border: `1px solid ${theme.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px',
                  }}>
                    {isReady ? '🐣' : '🥚'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '7px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {egg.source_product_name}
                    </div>
                    <div style={{ fontSize: '7px', color: isReady ? theme.success : theme.textMuted, marginTop: '2px' }}>
                      {remaining}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => chrome.tabs.create({ url: webAppUrl })}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px', padding: '10px',
            background: theme.accent, color: theme.text, border: `2px solid ${theme.border}`,
            boxShadow: `3px 3px 0 ${theme.border}`, cursor: 'pointer',
            textShadow: `1px 1px 0 ${theme.border}`,
          }}
        >
          Open Hatchling App
        </button>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px', padding: '8px',
            background: theme.surface, color: theme.textMuted, border: `2px solid ${theme.border}`,
            cursor: 'pointer',
            boxShadow: `1px 1px 0 ${theme.border}`,
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
