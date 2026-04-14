import { motion } from 'framer-motion';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  delay?: number;
}

export function StatCard({ icon, value, label, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="bg-theme-surface border-2 border-theme-border rounded-card shadow-soft-md p-3 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-bold font-body" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="text-xs text-theme-text-muted font-body mt-0.5">{label}</div>
    </motion.div>
  );
}
