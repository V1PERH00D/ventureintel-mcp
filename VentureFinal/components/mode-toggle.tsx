'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp } from 'lucide-react'

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: 'simulation' | 'analysis'
  onChange: (mode: 'simulation' | 'analysis') => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 shadow-lg backdrop-blur-md"
    >
      <button
        onClick={() => onChange('simulation')}
        className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          mode === 'simulation'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {mode === 'simulation' && (
          <motion.span
            layoutId="toggle-bg"
            className="absolute inset-0 rounded-full bg-primary/20 ring-1 ring-primary/30"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <span className="relative flex items-center gap-1.5">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Startup Simulation</span>
        </span>
      </button>

      <button
        onClick={() => onChange('analysis')}
        className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          mode === 'analysis'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {mode === 'analysis' && (
          <motion.span
            layoutId="toggle-bg"
            className="absolute inset-0 rounded-full bg-primary/20 ring-1 ring-primary/30"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <span className="relative flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Venture Catalyst</span>
        </span>
      </button>
    </motion.div>
  )
}
