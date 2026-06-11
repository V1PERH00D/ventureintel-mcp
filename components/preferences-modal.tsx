"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Settings, X } from "lucide-react"
import {
  usePreferences,
  type Theme,
  type InterfaceScale,
} from "@/lib/preferences-context"

export function PreferencesModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme, scale, setScale } = usePreferences()

  const themes: { value: Theme; label: string }[] = [
    { value: "dark", label: "Dark Mode" },
    { value: "deep-black", label: "Deep Black" },
    { value: "cyber-grid", label: "Cyber Grid" },
  ]

  const scales: { value: InterfaceScale; label: string }[] = [
    { value: "compact", label: "Compact" },
    { value: "default", label: "Default" },
    { value: "spacious", label: "Spacious" },
  ]

  return (
    <>
      {/* Settings button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-all hover:text-foreground hover:border-primary/30 hover:bg-secondary/60 active:scale-95"
        aria-label="Open preferences"
      >
        <Settings className="h-4 w-4" />
      </button>

      {/* Modal backdrop and content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 32,
              }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <div className="glass rounded-2xl border border-border/60 p-6 sm:p-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Preferences
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                    aria-label="Close preferences"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Theme selector */}
                <div className="mb-6 space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`relative rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                          theme === t.value
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {theme === t.value && (
                          <motion.span
                            layoutId="theme-active"
                            className="absolute inset-0 rounded-lg border border-primary/60"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span className="relative">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scale selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Interface Scale
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {scales.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setScale(s.value)}
                        className={`relative rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                          scale === s.value
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {scale === s.value && (
                          <motion.span
                            layoutId="scale-active"
                            className="absolute inset-0 rounded-lg border border-primary/60"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span className="relative">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer note */}
                <div className="mt-6 rounded-lg border border-border/40 bg-secondary/20 p-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your preferences are stored in memory. Connect to a backend to persist
                    settings across sessions.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
