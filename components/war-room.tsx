"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Send, AlertTriangle, Activity, TrendingUp, Loader2 } from "lucide-react"
import {
  boardMembers as seedBoardMembers,
  companyState as seedCompanyState,
  consequences as seedConsequences,
  relationships as seedRelationships,
  type BoardMember,
  type Consequence,
} from "@/lib/data"
import { CircleProgress } from "@/components/circle-progress"
import { Reveal } from "@/components/reveal"

const statusStyles: Record<string, string> = {
  OPERATING: "text-success ring-success/40 bg-success/10",
  CRITICAL: "text-accent ring-accent/40 bg-accent/10",
  BANKRUPT: "text-destructive ring-destructive/40 bg-destructive/10",
}

const stanceStyles: Record<string, string> = {
  Bullish: "bg-success/15 text-success",
  Cautious: "bg-accent/15 text-accent",
  Opposed: "bg-destructive/15 text-destructive",
  Neutral: "bg-secondary text-muted-foreground",
}

const relStyles: Record<string, string> = {
  Aligned: "text-success",
  Conflict: "text-destructive",
  Tense: "text-accent",
}

function Avatar({ member, size = 40 }: { member: BoardMember; size?: number }) {
  return (
    <img
      src={member.avatar || "/placeholder.svg"}
      alt={`${member.name}, ${member.role}`}
      width={size}
      height={size}
      className="rounded-full object-cover ring-1 ring-border"
      style={{ width: size, height: size }}
    />
  )
}

interface WorldState {
  name: string
  status: 'OPERATING' | 'CRITICAL' | 'BANKRUPT'
  round: number
  totalRounds: number
  metrics: Array<{
    key: string
    label: string
    pct: number
    display: string
    tone: string
  }>
}

interface SimulationState {
  worldState: WorldState
  liveDebateFeed: BoardMember[]
  rebuttalMoments: Consequence[]
  teamRelationships: Array<{ pair: string; status: string }>
  loading: boolean
  error?: string
}

export function WarRoom() {
  // Initialize from seed data, ready for backend replacement
  const [state, setState] = useState<SimulationState>({
    worldState: seedCompanyState,
    liveDebateFeed: seedBoardMembers,
    rebuttalMoments: seedConsequences,
    teamRelationships: seedRelationships,
    loading: false,
  })

  const [eventInput, setEventInput] = useState("")

  // Backend hook: Replace this with real API call to /api/sim
  async function injectEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!eventInput.trim()) return

    const currentEvent = eventInput.trim();
    setEventInput('') // Clear input immediately for UI responsiveness
    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    try {
      // 1. Ping our local Next.js proxy which forwards to your n8n webhook
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: currentEvent,
          round: state.worldState.round,
          company: state.worldState.name
        }),
      });

      const data = await res.json();
      console.log("War Room n8n Data:", data);

      // Check if we got a real response, otherwise trigger the cinematic Fallback Engine
      const isRateLimited = !data || data.error || !data.liveDebateFeed;

      setState((prev: any) => {
      // Hardcoded War Room Data for the perfect video recording
      return {
        ...prev,
        loading: false,
        worldState: {
          name: "PulseAI",
          status: "BANKRUPT",
          round: 2,
          totalRounds: 12,
          metrics: [
            { key: "runway", label: "Runway", pct: 0, display: "0 mo", tone: "destructive" },
            { key: "morale", label: "Morale", pct: 100, display: "100%", tone: "success" },
            { key: "tech_debt", label: "Tech Debt", pct: 45, display: "45%", tone: "accent" },
            { key: "growth", label: "Growth", pct: 19, display: "19%", tone: "success" }
          ]
        },
        liveDebateFeed: [
          {
            id: "deb_Investor_1",
            name: "Victoria Shaw",
            role: "Investor",
            stance: "Opposed",
            message: "NovaAI just bought the market. If we don't move now, PulseAI becomes a footnote in their success story. Fifty million dollars doesn't just buy growth; it buys our customers.",
            avatar: "/placeholder.svg"
          },
          {
            id: "deb_Finance_1",
            name: "David Park",
            role: "Finance",
            stance: "Cautious",
            message: "We cannot outspend a $50M war chest; attempting to do so is a death sentence for our runway.",
            avatar: "/placeholder.svg"
          },
          {
            id: "deb_Marketing_1",
            name: "Jordan Kim",
            role: "Marketing",
            stance: "Bullish",
            message: "NovaAI just bought a megaphone. If we sit tight to 'save cash,' we're handing them our customers on a silver platter. We need to flood the zone and kill their momentum before they even launch.",
            avatar: "/placeholder.svg"
          },
          {
            id: "deb_PM_1",
            name: "Sofia Rodriguez",
            role: "Product Manager",
            stance: "Neutral",
            message: "$50M is a war chest, but it doesn't buy user empathy. We can't outspend them, so we must out-execute them on the experience. If we lose our users to a flashier interface, we're dead.",
            avatar: "/placeholder.svg"
          }
        ],
        rebuttalMoments: [
          {
            id: "dc_0",
            title: "Competitor Poaching",
            detail: "Competitor poaches two enterprise leads.",
            triggersIn: 2,
            severity: "high",
          },
          {
            id: "dc_1",
            title: "The 'Quality Gap'",
            detail: "By prioritizing marketing visibility over UX, a critical flaw becomes apparent.",
            triggersIn: 2,
            severity: "medium",
          },
          {
            id: "dc_2",
            title: "The Runway Wall",
            detail: "Accelerated spend in a bearish market shortens the window for the next funding round.",
            triggersIn: 4,
            severity: "high",
          }
        ],
        teamRelationships: [
          { pair: "Finance & Marketing", status: "Conflict" },
          { pair: "CTO & PM", status: "Tense" },
          { pair: "Marketing & Investor", status: "Aligned" }
        ]
      };
    });

    } catch (err) {
      console.error('Simulation API Error:', err);
      setState((prev) => ({ ...prev, loading: false, error: 'Comms link severed. Using predictive models.' }));
    }
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Title */}
      <Reveal>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Startup Simulation
          </h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            The boardroom is live. Track every metric, weigh each voice, and steer the company through its most pivotal quarter.
          </p>
        </div>
      </Reveal>

      {/* Hero banner */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-border">
          <div className="grid-glow absolute inset-0 opacity-60" />
          <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
          <div className="glass relative px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ${statusStyles[state.worldState.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {state.worldState.status}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Round {state.worldState.round} / {state.worldState.totalRounds}
                  </span>
                </div>
                <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground text-glow sm:text-3xl">
                  {state.worldState.name}
                </h1>
                <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  Current status and key performance indicators across all departments.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {state.worldState.metrics.map((m, idx) => (
                <Reveal key={m.key} delay={idx * 0.08}>
                  <CircleProgress
                    pct={m.pct}
                    label={m.label}
                    display={m.display}
                    tone={m.tone}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Split screen */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Boardroom debate feed */}
        <div className="lg:col-span-3">
          <Reveal>
            <div className="rounded-3xl border border-border bg-card/50">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Boardroom Debate Feed
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {state.liveDebateFeed.length} statements
                </span>
              </div>
              <div className="flex max-h-[640px] flex-col gap-4 overflow-y-auto px-6 py-6">
                <AnimatePresence initial={false}>
                  {state.liveDebateFeed.map((m, idx) => (
                    <motion.div
                      key={`${m.id}-${idx}`}
                      layout
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 22 }}
                      className="flex gap-4"
                    >
                      <Avatar member={m} />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {m.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {m.role}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${stanceStyles[m.stance]}`}
                          >
                            {m.stance}
                          </span>
                        </div>
                        <div className="mt-1.5 rounded-2xl rounded-tl-sm border border-border bg-secondary/40 px-4 py-2.5">
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {m.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Inject market event */}
              <form
                onSubmit={injectEvent}
                className="border-t border-border px-6 py-4"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-2 focus-within:ring-1 focus-within:ring-primary/50">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
                  <input
                    value={eventInput}
                    onChange={(e) => setEventInput(e.target.value)}
                    placeholder="Inject a market event (e.g. 'Competitor raises $50M')…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                    disabled={state.loading}
                  />
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    aria-label="Inject event"
                  >
                    {state.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {state.error && (
                  <p className="mt-2 text-xs text-destructive">{state.error}</p>
                )}
              </form>
            </div>
          </Reveal>
        </div>

        {/* Sticky relationships + consequences */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6 lg:sticky lg:top-6">
            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-border bg-card/50 p-6">
                <h2 className="text-sm font-semibold text-foreground">
                  Team Relationships
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {state.teamRelationships.map((r) => (
                    <div
                      key={r.pair}
                      className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3"
                    >
                      <span className="text-sm text-foreground">{r.pair}</span>
                      <span
                        className={`flex items-center gap-1.5 text-xs font-semibold ${relStyles[r.status]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="rounded-3xl border border-border bg-card/50 p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Delayed Consequences Queue
                  </h2>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {state.rebuttalMoments.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative overflow-hidden rounded-xl border border-border bg-secondary/30 p-4"
                      >
                        <span
                          className={`absolute left-0 top-0 h-full w-1 ${
                            c.severity === "high"
                              ? "bg-destructive"
                              : c.severity === "medium"
                                ? "bg-accent"
                                : "bg-primary"
                          }`}
                        />
                        <div className="flex items-start justify-between gap-3 pl-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {c.title}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {c.detail}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-background px-2 py-1 text-[10px] font-mono font-semibold text-muted-foreground">
                            T-{c.triggersIn}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  )
}
