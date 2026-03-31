import { useState, useEffect } from 'preact/hooks';

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

export function Popup() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response: StatusData) => {
      setStatus(response);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🥚</div>
        <div>Loading...</div>
      </div>
    );
  }

  if (!status?.isLoggedIn) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🐣</div>
        <h2 style={{ fontSize: '14px', marginBottom: '16px' }}>Hatchling</h2>
        <p style={{ marginBottom: '8px', color: '#666' }}>
          Turn impulse purchases into collectible creatures!
        </p>
        <p style={{ marginBottom: '20px', color: '#888', fontSize: '7px' }}>
          Log in to start earning tokens and hatching eggs.
        </p>
        <button
          onClick={() => {
            chrome.tabs.create({ url: (status?.webAppUrl || 'http://localhost:5173') + '/login' });
          }}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            padding: '12px 24px',
            background: '#78c850',
            color: '#fff',
            border: '3px solid #333',
            boxShadow: '4px 4px 0 #333',
            cursor: 'pointer',
            textShadow: '1px 1px 0 #333',
          }}
        >
          Log In
        </button>
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

  const rarityColors: Record<number, string> = {
    1: '#a8a878', 2: '#78c850', 3: '#6890f0', 4: '#f8d030', 5: '#f85888',
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #333', paddingBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>🐣</span>
        <h2 style={{ fontSize: '12px', marginTop: '4px' }}>Hatchling</h2>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>🪙</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{status.tokenCount || 0}</div>
          <div style={{ fontSize: '6px', color: '#888' }}>tokens</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>💰</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#78c850' }}>
            ${((status.totalSaved || 0) / 100).toFixed(0)}
          </div>
          <div style={{ fontSize: '6px', color: '#888' }}>saved</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>🥚</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{eggs.length}</div>
          <div style={{ fontSize: '6px', color: '#888' }}>eggs</div>
        </div>
      </div>

      {/* Active eggs */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '8px', marginBottom: '8px' }}>Active Eggs</h3>
        {eggs.length === 0 ? (
          <div style={{
            background: '#fff', border: '2px solid #ddd', padding: '12px',
            textAlign: 'center', color: '#888', fontSize: '7px',
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
                    background: '#fff',
                    border: '2px solid #333',
                    padding: '8px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{
                    width: '24px', height: '28px',
                    background: rarityColors[egg.rarity] || '#ccc',
                    border: '1px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px',
                  }}>
                    {isReady ? '🐣' : '🥚'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '7px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {egg.source_product_name}
                    </div>
                    <div style={{ fontSize: '7px', color: isReady ? '#78c850' : '#888', marginTop: '2px' }}>
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
            background: '#6890f0', color: '#fff', border: '2px solid #333',
            boxShadow: '3px 3px 0 #333', cursor: 'pointer',
            textShadow: '1px 1px 0 #333',
          }}
        >
          Open Hatchling App
        </button>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px', padding: '8px',
            background: '#e8e8e8', color: '#666', border: '2px solid #333',
            cursor: 'pointer',
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
