"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Hexagon } from "lucide-react"
import { PreferencesProvider } from "@/lib/preferences-context"
import { WarRoom } from "@/components/war-room"
import { VentureIntel } from "@/components/venture-intel"
import { ModeToggle } from "@/components/mode-toggle"
import { PreferencesModal } from "@/components/preferences-modal"

export default function Page() {
  const [mode, setMode] = useState<'simulation' | 'analysis'>('simulation')

  return (
    <PreferencesProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Branding header - top-left */}
        <div className="fixed left-4 top-4 z-40 flex items-center gap-3 sm:left-6 sm:top-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Hexagon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-foreground">Venture Intel</p>
            <p className="mt-1 text-xs text-muted-foreground">Command Center</p>
          </div>
        </div>

        {/* Mode toggle + preferences controls - top-right */}
        <div className="fixed right-4 top-4 z-40 flex items-center gap-2 sm:right-6 sm:top-6">
          <ModeToggle mode={mode} onChange={setMode} />
          <PreferencesModal />
        </div>

        {/* Grid background */}
        <div className="grid-glow pointer-events-none absolute inset-0 opacity-30" />

        {/* Main content */}
        <main className="relative mx-auto w-full max-w-6xl px-4 py-8 pt-24 sm:pt-8 sm:px-6 lg:px-10 lg:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {mode === 'simulation' ? <WarRoom /> : <VentureIntel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </PreferencesProvider>
  )
}
