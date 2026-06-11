"use client"

import { motion } from "framer-motion"
import { Swords, LineChart, Hexagon } from "lucide-react"

export type AppId = "simulation" | "analysis"

const items: { id: AppId; label: string; sub: string; icon: typeof Swords }[] = [
  { id: "simulation", label: "Startup Sim", sub: "Simulation Mode", icon: Swords },
  { id: "analysis", label: "Venture Intel", sub: "Analysis Mode", icon: LineChart },
]

export function Sidebar({
  active,
  onChange,
}: {
  active: AppId
  onChange: (id: AppId) => void
}) {
  return (
    <aside className="sticky top-0 z-40 h-auto w-full shrink-0 border-b border-border lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="glass flex h-full flex-col gap-8 px-5 py-5 lg:px-6 lg:py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Hexagon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-foreground">Venture Intel</p>
            <p className="mt-1 text-xs text-muted-foreground">Command Center</p>
          </div>
        </div>

        <nav className="flex flex-row gap-2 lg:flex-col">
          {items.map((item) => {
            const isActive = active === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className="group relative flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors lg:flex-none"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-primary/12 ring-1 ring-primary/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="relative hidden flex-col sm:flex">
                  <span
                    className={`text-sm font-medium leading-tight ${
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.sub}</span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto hidden rounded-xl border border-border bg-secondary/40 p-4 lg:block">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Live simulation. All metrics update as decisions ripple through the
            board.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-xs font-medium text-foreground">Session active</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
