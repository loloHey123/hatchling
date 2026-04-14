import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { PixelButton } from '../components/PixelButton';
import { PixelFrame } from '../components/PixelFrame';

function AnimatedEgg() {
  return (
    <motion.div
      className="relative inline-block"
      style={{ width: 120, height: 140 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-theme-border shadow-soft-lg"
        style={{
          width: 100,
          height: 120,
          background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-warning) 40%, var(--color-accent) 100%)',
          animation: 'eggWobble 2.5s ease-in-out infinite',
        }}
      >
        <div className="absolute w-3 h-3 rounded-full bg-rarity-uncommon top-[30%] left-[20%]" />
        <div className="absolute w-4 h-4 rounded-full bg-rarity-rare top-[50%] right-[18%]" />
        <div className="absolute w-2 h-2 rounded-full bg-rarity-mythic top-[65%] left-[35%]" />
      </div>
      <motion.div
        className="absolute top-0 right-0 text-lg"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-4 left-0 text-sm"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      >
        ✨
      </motion.div>
    </motion.div>
  );
}

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
      if (error) setError(error.message);
      else setSuccess('Check your email to confirm your account!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setAuthLoading(false);
  };

  const inputClass = 'w-full border-2 border-theme-border bg-theme-bg px-3 py-2.5 font-body text-sm rounded-button outline-none focus:border-theme-accent transition-colors';

  return (
    <PixelFrame className="w-full max-w-md mx-auto">
      <div className="flex border-b-2 border-theme-border mb-4 -mx-4 -mt-4 px-4">
        <button
          onClick={() => { setAuthMode('signup'); setError(''); setSuccess(''); }}
          className={`font-body font-bold text-sm px-4 py-3 border-b-[3px] transition-colors bg-transparent cursor-pointer ${
            authMode === 'signup'
              ? 'border-theme-accent text-theme-text'
              : 'border-transparent text-theme-text-muted hover:text-theme-text'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
          className={`font-body font-bold text-sm px-4 py-3 border-b-[3px] transition-colors bg-transparent cursor-pointer ${
            authMode === 'login'
              ? 'border-theme-accent text-theme-text'
              : 'border-transparent text-theme-text-muted hover:text-theme-text'
          }`}
        >
          Log In
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {authMode === 'signup' && (
          <div>
            <label className="block font-body text-xs font-bold text-theme-text-muted mb-1">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Trainer" className={inputClass} />
          </div>
        )}
        <div>
          <label className="block font-body text-xs font-bold text-theme-text-muted mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="trainer@hatchling.gg" className={inputClass} />
        </div>
        <div>
          <label className="block font-body text-xs font-bold text-theme-text-muted mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className={inputClass} />
        </div>

        {error && (
          <motion.p
            className="font-body text-sm text-theme-danger bg-theme-danger/10 border-2 border-theme-danger/30 px-3 py-2 rounded-button"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            className="font-body text-sm text-theme-success bg-theme-success/10 border-2 border-theme-success/30 px-3 py-2 rounded-button"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </motion.p>
        )}

        <PixelButton type="submit" size="lg" disabled={authLoading} className="w-full mt-1">
          {authLoading ? 'Loading...' : authMode === 'signup' ? 'Start Hatching!' : 'Log In'}
        </PixelButton>
      </form>
    </PixelFrame>
  );
}

function StepCard({ step, icon, title, desc, delay }: { step: number; icon: string; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      className="flex-1 min-w-[200px]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      viewport={{ once: true }}
    >
      <PixelFrame className="text-center h-full">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="font-body text-xs font-bold text-theme-accent mb-1">Step {step}</div>
        <h3 className="font-body text-sm font-bold text-theme-text mb-2">{title}</h3>
        <p className="font-body text-xs text-theme-text-muted leading-relaxed">{desc}</p>
      </PixelFrame>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
    >
      <PixelFrame className="text-center h-full">
        <div className="text-2xl mb-2">{icon}</div>
        <h4 className="font-body text-sm font-bold text-theme-text mb-1">{title}</h4>
        <p className="font-body text-xs text-theme-text-muted leading-relaxed">{desc}</p>
      </PixelFrame>
    </motion.div>
  );
}

export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-sm text-theme-text-muted">Loading...</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-theme-surface border-b border-theme-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🐣</span>
          <span className="font-pixel text-pixel-lg">Hatchling</span>
        </div>
        <a href="#auth" className="font-body text-sm font-bold text-theme-accent hover:brightness-110 no-underline transition-all">
          Log In / Sign Up
        </a>
      </header>

      {/* Hero */}
      <section className="text-center py-16 sm:py-24 px-4">
        <div className="mb-6">
          <AnimatedEgg />
        </div>

        <motion.h1
          className="font-pixel text-pixel-2xl sm:text-[32px] text-theme-text mb-4 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Hatchling
        </motion.h1>
        <motion.p
          className="font-body text-base sm:text-lg text-theme-text-muted mb-8 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Turn impulse purchases into pixel friends.
          <br />
          Resist the urge, earn gacha tokens, hatch mystery creatures.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <a href="#auth"><PixelButton size="lg">Get Started Free</PixelButton></a>
          <a href="#how-it-works"><PixelButton variant="secondary" size="lg">How It Works</PixelButton></a>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4">
        <h2 className="font-pixel text-pixel-xl text-theme-text text-center mb-10">How It Works</h2>
        <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto">
          <StepCard step={1} icon="🛑" title="Resist" desc="Our extension detects impulse purchases. Choose to delay and save your money." delay={0} />
          <StepCard step={2} icon="🎰" title="Pull" desc="Earn a gacha token for each resisted purchase. Pull the machine for a mystery egg!" delay={0.1} />
          <StepCard step={3} icon="🥚" title="Collect" desc="Wait for your egg to hatch and build an amazing creature collection." delay={0.2} />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-theme-surface/30">
        <h2 className="font-pixel text-pixel-xl text-theme-text text-center mb-10">Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard icon="💰" title="Savings Tracker" desc="See exactly how much you've saved by resisting impulse buys." delay={0} />
          <FeatureCard icon="🐾" title="100+ Creatures" desc="Collect creatures across 5 rarity tiers from Common to Mythic." delay={0.05} />
          <FeatureCard icon="⚔️" title="Quests & Care" desc="Send creatures on expeditions and care for them like virtual pets." delay={0.1} />
          <FeatureCard icon="🏆" title="Achievements" desc="Unlock badges, earn XP, and level up your trainer profile." delay={0.15} />
        </div>
      </section>

      {/* Rarity preview */}
      <section className="py-12 px-4">
        <h2 className="font-pixel text-pixel-lg text-theme-text text-center mb-6">Rarity Tiers</h2>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {[
            { label: 'Common', color: 'var(--color-rarity-common)', pct: '50%' },
            { label: 'Uncommon', color: 'var(--color-rarity-uncommon)', pct: '25%' },
            { label: 'Rare', color: 'var(--color-rarity-rare)', pct: '15%' },
            { label: 'Legendary', color: 'var(--color-rarity-legendary)', pct: '8%' },
            { label: 'Mythic', color: 'var(--color-rarity-mythic)', pct: '2%' },
          ].map(({ label, color, pct }, i) => (
            <motion.div
              key={label}
              className="border-2 border-theme-border rounded-card shadow-soft-sm px-4 py-3 text-center bg-theme-surface"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
            >
              <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ background: color }} />
              <div className="font-body text-xs font-bold text-theme-text">{label}</div>
              <div className="font-body text-[10px] text-theme-text-muted">{pct}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Auth */}
      <section id="auth" className="py-16 px-4 bg-theme-surface/30">
        <h2 className="font-pixel text-pixel-xl text-theme-text text-center mb-2">Join the Hatchery</h2>
        <p className="font-body text-sm text-theme-text-muted text-center mb-8">
          Create an account and start hatching today.
        </p>
        <AuthForm />
      </section>

      {/* Footer */}
      <footer className="bg-theme-surface border-t border-theme-border text-theme-text-muted py-6 px-4 text-center">
        <p className="font-body text-sm mb-1">🐣 Hatchling — Turn impulse purchases into pixel friends</p>
        <p className="font-body text-xs text-theme-text-muted">Made with delayed gratification</p>
      </footer>
    </div>
  );
}
