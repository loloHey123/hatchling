import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { PixelButton } from '../components/PixelButton';
import { PixelFrame } from '../components/PixelFrame';

/* ───────────────── animated egg (CSS-only) ───────────────── */
function AnimatedEgg() {
  return (
    <div className="relative inline-block" style={{ width: 120, height: 140 }}>
      {/* egg body */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-[4px] border-theme-border"
        style={{
          width: 100,
          height: 120,
          background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-warning) 40%, #e8a020 100%)',
          animation: 'eggWobble 2.5s ease-in-out infinite',
        }}
      >
        {/* spots — decorative game elements, keep rarity-inspired inline colors */}
        <div className="absolute w-3 h-3 rounded-full bg-rarity-uncommon border-2 border-theme-border top-[30%] left-[20%]" />
        <div className="absolute w-4 h-4 rounded-full bg-rarity-rare border-2 border-theme-border top-[50%] right-[18%]" />
        <div className="absolute w-2 h-2 rounded-full bg-rarity-mythic border-2 border-theme-border top-[65%] left-[35%]" />
      </div>
      {/* sparkles */}
      <div className="absolute top-0 right-0 text-lg" style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}>
        ✨
      </div>
      <div className="absolute top-4 left-0 text-sm" style={{ animation: 'sparkle 1.5s ease-in-out infinite 0.5s' }}>
        ✨
      </div>
    </div>
  );
}

/* ───────────────── auth form ───────────────── */
function AuthForm() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAuthLoading(true);

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || 'Trainer' } },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Check your email to confirm your account!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setAuthLoading(false);
  };

  return (
    <PixelFrame className="w-full max-w-md mx-auto">
      {/* toggle */}
      <div className="flex border-b-2 border-theme-border mb-4 -mx-4 -mt-4 px-4">
        <button
          onClick={() => { setAuthMode('signup'); setError(''); setSuccess(''); }}
          className={`font-pixel text-pixel-sm px-4 py-3 border-b-[3px] transition-colors bg-transparent cursor-pointer ${
            authMode === 'signup'
              ? 'border-theme-success text-theme-text'
              : 'border-transparent text-theme-text-muted hover:text-theme-text-muted'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
          className={`font-pixel text-pixel-sm px-4 py-3 border-b-[3px] transition-colors bg-transparent cursor-pointer ${
            authMode === 'login'
              ? 'border-theme-accent text-theme-text'
              : 'border-transparent text-theme-text-muted hover:text-theme-text-muted'
          }`}
        >
          Log In
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {authMode === 'signup' && (
          <div>
            <label className="block font-pixel text-pixel-sm text-theme-text-muted mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Trainer"
              className="w-full border-[3px] border-theme-border bg-theme-bg px-3 py-2 font-pixel text-pixel-sm outline-none focus:border-theme-success transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block font-pixel text-pixel-sm text-theme-text-muted mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="trainer@hatchling.gg"
            className="w-full border-[3px] border-theme-border bg-theme-bg px-3 py-2 font-pixel text-pixel-sm outline-none focus:border-theme-success transition-colors"
          />
        </div>

        <div>
          <label className="block font-pixel text-pixel-sm text-theme-text-muted mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full border-[3px] border-theme-border bg-theme-bg px-3 py-2 font-pixel text-pixel-sm outline-none focus:border-theme-success transition-colors"
          />
        </div>

        {error && (
          <p className="font-pixel text-pixel-sm text-theme-danger bg-[#fff0f0] border-2 border-theme-danger px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="font-pixel text-pixel-sm text-theme-success bg-[#f0fff0] border-2 border-theme-success px-3 py-2">
            {success}
          </p>
        )}

        <PixelButton
          type="submit"
          variant={authMode === 'signup' ? 'primary' : 'primary'}
          size="lg"
          disabled={authLoading}
          className="w-full mt-1"
        >
          {authLoading
            ? 'Loading...'
            : authMode === 'signup'
              ? 'Start Hatching!'
              : 'Log In'}
        </PixelButton>
      </form>
    </PixelFrame>
  );
}

/* ───────────────── step card ───────────────── */
function StepCard({ step, icon, title, desc }: { step: number; icon: string; title: string; desc: string }) {
  return (
    <PixelFrame className="text-center flex-1 min-w-[200px]">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-pixel text-pixel-sm text-theme-success mb-1">Step {step}</div>
      <h3 className="font-pixel text-pixel-base text-theme-text mb-2">{title}</h3>
      <p className="font-pixel text-pixel-sm text-theme-text-muted leading-relaxed">{desc}</p>
    </PixelFrame>
  );
}

/* ───────────────── feature card ───────────────── */
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-theme-surface border-[3px] border-theme-border shadow-pixel-lg p-4 text-center hover:-translate-y-1 transition-transform">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-pixel text-pixel-sm text-theme-text mb-1">{title}</h4>
      <p className="font-pixel text-pixel-xs text-theme-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

/* ───────────────── keyframes (injected once) ───────────────── */
function InjectKeyframes() {
  useEffect(() => {
    const id = 'landing-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes eggWobble {
        0%, 100% { transform: translateX(-50%) rotate(0deg); }
        25%      { transform: translateX(-50%) rotate(3deg); }
        75%      { transform: translateX(-50%) rotate(-3deg); }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        50%      { opacity: 1; transform: scale(1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-8px); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
  return null;
}

/* ═══════════════════ LANDING PAGE ═══════════════════ */
export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Don't render anything while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-pixel-bg flex items-center justify-center">
        <p className="font-pixel text-pixel-base text-theme-text-muted">Loading...</p>
      </div>
    );
  }

  // Logged-in users are redirected above
  if (user) return null;

  return (
    <div className="min-h-screen bg-pixel-bg">
      <InjectKeyframes />

      {/* ── Header bar ── */}
      <header className="bg-theme-text text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐣</span>
          <span className="font-pixel text-pixel-lg">Hatchling</span>
        </div>
        <a
          href="#auth"
          className="font-pixel text-pixel-sm text-theme-success hover:text-[#8ad860] no-underline transition-colors"
        >
          Log In / Sign Up
        </a>
      </header>

      {/* ── Hero ── */}
      <section className="text-center py-16 sm:py-24 px-4">
        <div style={{ animation: 'float 3s ease-in-out infinite' }} className="mb-6">
          <AnimatedEgg />
        </div>

        <h1 className="font-pixel text-pixel-2xl sm:text-[32px] text-theme-text mb-4 leading-tight">
          Hatchling
        </h1>
        <p className="font-pixel text-pixel-base sm:text-pixel-lg text-theme-text-muted mb-8 max-w-lg mx-auto leading-relaxed">
          Turn impulse purchases into pixel friends.
          <br />
          Resist the urge, earn gacha tokens, hatch mystery creatures.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#auth">
            <PixelButton size="lg">Get Started Free</PixelButton>
          </a>
          <a href="#how-it-works">
            <PixelButton variant="secondary" size="lg">How It Works</PixelButton>
          </a>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-16 px-4 bg-theme-bg">
        <h2 className="font-pixel text-pixel-xl text-theme-text text-center mb-10">
          How It Works
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto">
          <StepCard
            step={1}
            icon="🛑"
            title="Resist"
            desc="Our extension detects impulse purchases. Choose to delay and save your money."
          />
          <StepCard
            step={2}
            icon="🎰"
            title="Pull"
            desc="Earn a gacha token for each resisted purchase. Pull the machine for a mystery egg!"
          />
          <StepCard
            step={3}
            icon="🥚"
            title="Collect"
            desc="Wait for your egg to hatch and build an amazing creature collection."
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4">
        <h2 className="font-pixel text-pixel-xl text-theme-text text-center mb-10">
          Features
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon="💰"
            title="Savings Tracker"
            desc="See exactly how much you've saved by resisting impulse buys."
          />
          <FeatureCard
            icon="🐾"
            title="100+ Creatures"
            desc="Collect creatures across 5 rarity tiers from Common to Mythic."
          />
          <FeatureCard
            icon="🌿"
            title="Safari Adventures"
            desc="Send creatures on expeditions to discover items and bonuses."
          />
          <FeatureCard
            icon="🤝"
            title="Share & Compare"
            desc="Show off your collection and compare progress with friends."
          />
        </div>
      </section>

      {/* ── Rarity preview ── */}
      <section className="py-12 px-4 bg-theme-bg">
        <h2 className="font-pixel text-pixel-lg text-theme-text text-center mb-6">
          Rarity Tiers
        </h2>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {[
            { label: 'Common', color: 'var(--color-rarity-common)', pct: '50%' },
            { label: 'Uncommon', color: 'var(--color-rarity-uncommon)', pct: '25%' },
            { label: 'Rare', color: 'var(--color-rarity-rare)', pct: '15%' },
            { label: 'Legendary', color: 'var(--color-rarity-legendary)', pct: '8%' },
            { label: 'Mythic', color: 'var(--color-rarity-mythic)', pct: '2%' },
          ].map(({ label, color, pct }) => (
            <div
              key={label}
              className="border-[3px] border-theme-border shadow-pixel-md px-3 py-2 text-center bg-theme-surface"
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-theme-border mx-auto mb-1"
                style={{ background: color }}
              />
              <div className="font-pixel text-pixel-sm text-theme-text">{label}</div>
              <div className="font-pixel text-pixel-xs text-theme-text-muted">{pct}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Auth section ── */}
      <section id="auth" className="py-16 px-4">
        <h2 className="font-pixel text-pixel-xl text-theme-text text-center mb-2">
          Join the Hatchery
        </h2>
        <p className="font-pixel text-pixel-sm text-theme-text-muted text-center mb-8">
          Create an account and start hatching today.
        </p>
        <AuthForm />
      </section>

      {/* ── Footer ── */}
      <footer className="bg-theme-text text-theme-text-muted py-6 px-4 text-center">
        <p className="font-pixel text-pixel-sm mb-2 text-[#aaa]">
          🐣 Hatchling — Turn impulse purchases into pixel friends
        </p>
        <p className="font-pixel text-pixel-xs text-theme-text-muted">
          Made with delayed gratification
        </p>
      </footer>
    </div>
  );
}
