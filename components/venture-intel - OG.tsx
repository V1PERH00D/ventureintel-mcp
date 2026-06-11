"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Sparkles,
  Send,
  Building2,
  Target,
  Layers,
  Globe,
  Bot,
  Loader2,
} from "lucide-react"
import {
  scorecards as seedScorecards,
  reports as seedReports,
  industries,
  stages,
  type ScoreCard,
} from "@/lib/data"
import { Reveal } from "@/components/reveal"
import { Markdown } from "@/components/markdown"

interface DealAnalysisForm {
  startup_idea: string
  target_market: string
  geography: string
  stage: string
  industry: string
}

interface AnalysisResponse {
  scorecards: ScoreCard[]
  reports: Array<{ key: string; label: string; body: string }>
  error?: string
}

interface AnalysisState {
  form: DealAnalysisForm
  response: AnalysisResponse | null
  loading: boolean
  error?: string
}

type ChatMsg = { role: "user" | "bot"; text: string }

const toneRing: Record<string, string> = {
  primary: "group-hover:ring-primary/50 text-primary",
  accent: "group-hover:ring-accent/50 text-accent",
  success: "group-hover:ring-success/50 text-success",
  destructive: "group-hover:ring-destructive/50 text-destructive",
}
const toneBar: Record<string, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  destructive: "bg-destructive",
}

function ScorecardCard({ card, idx }: { card: ScoreCard; idx: number }) {
  return (
    <Reveal delay={idx * 0.08}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`group relative h-full overflow-hidden rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-transparent transition-all ${toneRing[card.tone]}`}
      >
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {card.title}
          </span>
          <span className={`font-mono text-2xl font-semibold ${toneRing[card.tone].split(" ").pop()}`}>
            {card.grade}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {card.summary}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Score</span>
            <span className="font-mono text-foreground">{card.score}/100</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className={`h-full rounded-full ${toneBar[card.tone]}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${card.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </motion.div>
    </Reveal>
  )
}

type ChatMsg = { role: "user" | "bot"; text: string }

export function VentureIntel() {
  const [state, setState] = useState<AnalysisState>({
    form: {
      startup_idea: '',
      target_market: '',
      geography: '',
      stage: stages[0],
      industry: industries[0],
    },
    response: {
      scorecards: seedScorecards,
      reports: seedReports,
    },
    loading: false,
  })

  const [tab, setTab] = useState(seedReports[0].key)
  const [chat, setChat] = useState<ChatMsg[]>([
    {
      role: "bot",
      text: "I'm your Venture Intel analyst. Ask me about market size, moat, risk, or the deal recommendation.",
    },
  ])
  const [chatInput, setChatInput] = useState("")

  // Backend hook: Replace with real API call to /api/venture
  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault()
    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    try {
      // BACKEND INTEGRATION POINT:
      // Replace this mock response with:
      // const res = await fetch('/api/venture', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(state.form),
      // })
      // const analysis: AnalysisResponse = await res.json()
      // setState((prev) => ({
      //   ...prev,
      //   response: analysis,
      //   loading: false,
      // }))

      // Mock response - replace with real n8n/backend output
      setState((prev) => ({
        ...prev,
        response: {
          scorecards: seedScorecards,
          reports: seedReports,
        },
        loading: false,
      }))
    } catch (err) {
      console.error('[v0] Analysis error:', err)
      setState((prev) => ({
        ...prev,
        error: 'Failed to run analysis. Please try again.',
        loading: false,
      }))
    }
  }

  // Backend hook: Replace with real LLM API call
  function sendChatMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim()) return
    const q = chatInput.trim()
    setChat((prev) => [
      ...prev,
      { role: "user", text: q },
      // BACKEND INTEGRATION POINT:
      // Stream LLM response from your backend:
      // const res = await fetch('/api/venture/chat', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     question: q,
      //     context: state.response,
      //   }),
      // })
      // const { answer } = await res.json()
      {
        role: "bot",
        text: "Based on the current scorecard, execution scores highest (A) while risk remains the key watch item. I'd anchor diligence on the data-moat thesis.",
      },
    ])
    setChatInput("")
  }

  const fields = [
    { icon: Sparkles, label: "Startup Idea", placeholder: "Autonomous warehouse fleet OS", key: "startup_idea" as const },
    { icon: Target, label: "Target Market", placeholder: "Mid-market 3PL operators", key: "target_market" as const },
    { icon: Globe, label: "Geography", placeholder: "North America", key: "geography" as const },
  ]

  const activeReport = state.response?.reports.find((r) => r.key === tab)

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Title */}
      <Reveal>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Venture Catalyst
          </h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            Feed a thesis. Get an institutional-grade composite scorecard and full diligence reports in seconds.
          </p>
        </div>
      </Reveal>

      {/* Header */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-border">
          <div className="grid-glow absolute inset-0 opacity-60" />
          <div className="absolute -right-20 -top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="glass relative px-6 py-8 sm:px-10 sm:py-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/30">
              <Sparkles className="h-3 w-3" />
              Investment Committee
            </span>
            <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground text-glow sm:text-3xl">
              Venture Catalyst Desk
            </h1>
            <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
              Analyze deal fundamentals. Run structured diligence. Get institutional-grade insights.
            </p>

            {/* Input form */}
            <form onSubmit={runAnalysis} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((f) => (
                <label key={f.label} className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {f.label}
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary/50">
                    <f.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={state.form[f.key]}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          form: { ...prev.form, [f.key]: e.target.value },
                        }))
                      }
                      placeholder={f.placeholder}
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                      disabled={state.loading}
                    />
                  </div>
                </label>
              ))}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Stage</span>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
                  <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <select
                    value={state.form.stage}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        form: { ...prev.form, stage: e.target.value },
                      }))
                    }
                    disabled={state.loading}
                    className="w-full bg-transparent text-sm text-foreground focus:outline-none disabled:opacity-50"
                  >
                    {stages.map((s) => (
                      <option key={s} className="bg-popover">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Industry</span>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <select
                    value={state.form.industry}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        form: { ...prev.form, industry: e.target.value },
                      }))
                    }
                    disabled={state.loading}
                    className="w-full bg-transparent text-sm text-foreground focus:outline-none disabled:opacity-50"
                  >
                    {industries.map((s) => (
                      <option key={s} className="bg-popover">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <button
                type="submit"
                disabled={state.loading}
                className="flex items-center justify-center gap-2 self-end rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {state.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {state.loading ? "Analyzing..." : "Run Analysis"}
              </button>
            </form>
          </div>
        </section>
      </Reveal>

      {/* Composite scorecard */}
      <div>
        <Reveal>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Composite Scorecard
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {state.response?.scorecards.map((c, i) => (
            <ScorecardCard key={c.key} card={c} idx={i} />
          ))}
        </div>
      </div>

      {/* Reports + chatbot */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tabbed reports */}
        <div className="lg:col-span-2">
          <Reveal>
            <div className="rounded-3xl border border-border bg-card/50">
              <div className="flex flex-wrap gap-1 border-b border-border p-2">
                {state.response?.reports.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setTab(r.key)}
                    className="relative rounded-xl px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm"
                  >
                    {tab === r.key && (
                      <motion.span
                        layoutId="report-tab"
                        className="absolute inset-0 rounded-xl bg-primary/12 ring-1 ring-primary/30"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative ${tab === r.key ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Markdown content={activeReport.body} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Chatbot side panel */}
        <div>
          <Reveal delay={0.12}>
            <div className="flex h-full min-h-[420px] flex-col rounded-3xl border border-border bg-card/50 lg:sticky lg:top-6">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <Bot className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Venture Intel Chatbot
                  </p>
                  <p className="text-xs text-success">● Online</p>
                </div>
              </div>
                <div className="flex 1 flex-col gap-3 overflow-y-auto px-5 py-4">
                {chat.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border border-border bg-secondary/50 text-foreground/90"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChatMessage} className="border-t border-border p-3">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2 focus-within:ring-1 focus-within:ring-primary/50">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this deal…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                    disabled={state.loading}
                  />
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {state.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
