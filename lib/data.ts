export type CompanyStatus = "OPERATING" | "CRITICAL" | "BANKRUPT"

export type Metric = {
  key: string
  label: string
  value: number
  /** 0-100 normalized for the ring */
  pct: number
  display: string
  tone: "primary" | "accent" | "success" | "destructive"
}

export const companyState = {
  name: "Helios Robotics",
  status: "OPERATING" as CompanyStatus,
  round: 7,
  totalRounds: 12,
  metrics: [
    {
      key: "budget",
      label: "Budget",
      value: 2.4,
      pct: 62,
      display: "$2.4M",
      tone: "primary",
    },
    {
      key: "runway",
      label: "Runway",
      value: 9,
      pct: 45,
      display: "9 mo",
      tone: "accent",
    },
    {
      key: "morale",
      label: "Morale",
      value: 78,
      pct: 78,
      display: "78%",
      tone: "success",
    },
    {
      key: "debt",
      label: "Tech Debt",
      value: 34,
      pct: 34,
      display: "34%",
      tone: "destructive",
    },
    {
      key: "growth",
      label: "Growth",
      value: 22,
      pct: 84,
      display: "+22% MoM",
      tone: "success",
    },
  ] satisfies Metric[],
}

export type Stance = "Bullish" | "Cautious" | "Opposed" | "Neutral"

export type BoardMember = {
  id: string
  name: string
  role: string
  avatar: string
  stance: Stance
  message: string
  accent: string
}

export const boardMembers: BoardMember[] = [
  {
    id: "maya",
    name: "Maya Chen",
    role: "CEO",
    avatar: "/avatars/maya.png",
    stance: "Bullish",
    message:
      "We ship the enterprise tier this quarter. Hesitation is how we lose the category.",
    accent: "primary",
  },
  {
    id: "arjun",
    name: "Arjun Mehta",
    role: "CTO",
    avatar: "/avatars/arjun.png",
    stance: "Cautious",
    message:
      "The platform can't take another rushed launch. Tech debt is already at 34%.",
    accent: "accent",
  },
  {
    id: "sofia",
    name: "Sofia Rodriguez",
    role: "PM",
    avatar: "/avatars/sofia.png",
    stance: "Neutral",
    message:
      "Customers want reliability over features. Let me re-scope to a phased rollout.",
    accent: "success",
  },
  {
    id: "jordan",
    name: "Jordan Kim",
    role: "Marketing",
    avatar: "/avatars/jordan.png",
    stance: "Bullish",
    message:
      "I've got three Tier-1 launch partners primed. The narrative window is now.",
    accent: "primary",
  },
  {
    id: "david",
    name: "David Park",
    role: "Finance",
    avatar: "/avatars/david.png",
    stance: "Opposed",
    message:
      "Nine months of runway. A failed launch puts us in the red by Q3. Hard no.",
    accent: "destructive",
  },
  {
    id: "victoria",
    name: "Victoria Shaw",
    role: "Investor",
    avatar: "/avatars/victoria.png",
    stance: "Cautious",
    message:
      "Show me a defensible moat before I unlock the bridge round. Numbers, not vibes.",
    accent: "chart-5",
  },
]

export type Relationship = {
  pair: string
  members: [string, string]
  status: "Aligned" | "Conflict" | "Tense"
}

export const relationships: Relationship[] = [
  { pair: "Maya ↔ Jordan", members: ["maya", "jordan"], status: "Aligned" },
  { pair: "Arjun ↔ David", members: ["arjun", "david"], status: "Aligned" },
  { pair: "Maya ↔ David", members: ["maya", "david"], status: "Conflict" },
  { pair: "Sofia ↔ Jordan", members: ["sofia", "jordan"], status: "Tense" },
  {
    pair: "Victoria ↔ Maya",
    members: ["victoria", "maya"],
    status: "Tense",
  },
]

export type Consequence = {
  id: string
  title: string
  detail: string
  triggersIn: number
  severity: "low" | "medium" | "high"
}

export const consequences: Consequence[] = [
  {
    id: "c1",
    title: "Key engineer attrition risk",
    detail: "Sustained crunch from last sprint surfaces in 2 rounds.",
    triggersIn: 2,
    severity: "high",
  },
  {
    id: "c2",
    title: "Enterprise pilot decision",
    detail: "Acme Corp signs or churns based on launch stability.",
    triggersIn: 1,
    severity: "medium",
  },
  {
    id: "c3",
    title: "Press embargo lifts",
    detail: "TechCrunch feature publishes — amplifies any outcome.",
    triggersIn: 3,
    severity: "low",
  },
]

/* ---------------- Venture Intel ---------------- */

export type ScoreCard = {
  key: string
  title: string
  grade: string
  score: number
  summary: string
  tone: "primary" | "accent" | "success" | "destructive"
}

export const scorecards: ScoreCard[] = [
  {
    key: "market",
    title: "Market Size",
    grade: "A−",
    score: 88,
    summary: "$48B TAM growing 19% CAGR with clear whitespace in mid-market.",
    tone: "primary",
  },
  {
    key: "moat",
    title: "Competitive Moat",
    grade: "B+",
    score: 76,
    summary: "Proprietary data flywheel; defensibility improves with scale.",
    tone: "accent",
  },
  {
    key: "risk",
    title: "Risk Rating",
    grade: "B",
    score: 68,
    summary: "Execution and regulatory exposure are the primary watch items.",
    tone: "destructive",
  },
  {
    key: "execution",
    title: "Execution Strategy",
    grade: "A",
    score: 91,
    summary: "Repeat founders, capital-efficient GTM, disciplined hiring plan.",
    tone: "success",
  },
]

export type Report = {
  key: string
  label: string
  title: string
  body: string
}

export const reports: Report[] = [
  {
    key: "market",
    label: "Market Intelligence",
    title: "Market Intelligence",
    body: `## Total Addressable Market

The autonomous logistics segment represents a **$48B** opportunity, expanding at a **19% CAGR** through 2030.

- **SAM:** $12.4B — mid-market warehousing & last-mile.
- **SOM (3yr):** $640M — beachhead in regional 3PL operators.

### Tailwinds
1. Labor shortages accelerating automation budgets.
2. Falling sensor + compute costs (down ~30% YoY).
3. Reshoring driving new domestic facility builds.

> Verdict: A large, structurally growing market with a credible wedge.`,
  },
  {
    key: "competitive",
    label: "Competitive Intelligence",
    title: "Competitive Intelligence",
    body: `## Landscape

Three incumbents hold ~60% share but are saddled with legacy hardware lock-in.

| Player | Strength | Weakness |
| --- | --- | --- |
| LegacyBot | Distribution | Closed platform |
| SwiftWare | Brand | Thin margins |
| **Target** | Data flywheel | Early traction |

### Moat Thesis
The proprietary fleet-telemetry dataset compounds with every deployment, creating switching costs and a self-reinforcing accuracy advantage.`,
  },
  {
    key: "risk",
    label: "Risk Assessment",
    title: "Risk Assessment",
    body: `## Risk Matrix

- **Execution (High):** Hardware + software dual-track stretches the team.
- **Regulatory (Medium):** Evolving autonomous-equipment safety standards.
- **Concentration (Medium):** Top 2 pilots = 54% of pipeline.
- **Capital (Low):** 18-month runway post-round at current burn.

### Mitigations
Phased rollout, design-partner co-funding, and a compliance hire in H1.`,
  },
  {
    key: "strategy",
    label: "Startup Strategy",
    title: "Startup Strategy",
    body: `## Recommended Strategy

1. **Land** with a single high-density 3PL beachhead.
2. **Expand** via usage-based pricing tied to throughput gains.
3. **Defend** by deepening the telemetry data moat.

### 12-Month Milestones
- 6 paying deployments
- $4.2M ARR
- Gross margin ≥ 58%

> Recommendation: **Proceed to term sheet** at proposed valuation with a milestone-based tranche.`,
  },
]

export const industries = [
  "Robotics & Automation",
  "Fintech",
  "Climate Tech",
  "Healthcare",
  "Developer Tools",
  "Consumer AI",
]

export const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Growth"]
