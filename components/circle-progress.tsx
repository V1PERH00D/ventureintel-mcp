"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const toneVar: Record<string, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  success: "var(--success)",
  destructive: "var(--destructive)",
  "chart-5": "var(--chart-5)",
}

export function CircleProgress({
  pct,
  label,
  display,
  tone = "primary",
  size = 132,
}: {
  pct: number
  label: string
  display: string
  tone?: string
  size?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = toneVar[tone] ?? toneVar.primary

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={inView ? { strokeDashoffset: c - (c * pct) / 100 } : {}}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 10px color-mix(in oklch, ${color} 70%, transparent))` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
            {display}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
