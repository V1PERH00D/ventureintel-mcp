import {
  isWarRoomResponse,
  normalizeTimelapseResponse,
  normalizeWarRoomResponse,
  toBackendCreatePayload,
  toBackendEventPayload,
  toBackendTimelapsePayload,
} from "./war-room-normalize";

export const API = {
  startupCreate: "https://coriemickey.app.n8n.cloud/webhook/startup/create",
  warRoom: "https://coriemickey.app.n8n.cloud/webhook/startup/event",
  timelapse: "https://coriemickey.app.n8n.cloud/webhook/startup/timelapse",
  ventureAnalyze: "https://coriemickey.app.n8n.cloud/webhook/venture-intel-analyze",
  ventureChat: "https://coriemickey.app.n8n.cloud/webhook/venture-intel-chat",
};

async function post<T>(url: string, body: unknown, retries = 1): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// Venture Intel types
export interface VentureAnalyzeInput {
  startup_idea: string;
  target_market: string;
  founder_context?: string;
  stage?: string;
  industry?: string;
  geography?: string;
  session_id?: string;
}

export interface VentureAnalysis {
  session_id?: string;
  verdict?: string;
  scores?: {
    overall?: number;
    confidence?: number;
    market?: number;
    competitive?: number;
    risk?: number;
    strategic?: number;
  };
  market?: any;
  competition?: any;
  risk?: any;
  strategy?: any;
  raw_report?: string;
  [k: string]: any;
}

export const ventureAnalyze = (input: VentureAnalyzeInput) =>
  post<unknown>(API.ventureAnalyze, input);

export const ventureChat = (input: { session_id?: string; message: string; history?: any[] }) =>
  post<{ reply?: string; message?: string; response?: string; [k: string]: any }>(API.ventureChat, input);

// War room types
export interface StartupCreateInput {
  startup_name: string;
  industry: string;
  idea: string;
  budget: number;
  runway: number;
  team_size: number;
  growth_strategy: string;
}

export interface AgentState {
  name: string;
  role?: string;
  influence: number;
  credibility: number;
  wins: number;
  losses: number;
  stance?: string;
  mood?: string;
  confidence: number;
  personality?: {
    risk_tolerance: number;
    aggressiveness: number;
    optimism: number;
    paranoia: number;
    confidence: number;
  };
  relationships?: Record<string, string>;
}

export interface WorldState {
  startup_id?: string;
  startupId?: string;
  startup?: any;
  company?: Record<string, any>;
  worldState?: Record<string, any>;
  agents?: AgentState[];
  agentVoices?: any[];
  rebuttalOutputs?: any[];
  rebuttalFeed?: any[];
  liveDebateFeed?: any[];
  agentMemory?: Record<string, any>;
  influence?: Record<string, number>;
  metrics?: Record<string, number>;
  status?: "OPERATING" | "CRITICAL" | "BANKRUPT" | string;
  current_event?: string;
  currentEvent?: string;
  event?: string;
  lastEvent?: string;
  decision?: string;
  narrative?: string;
  winning_coalition?: string[];
  opposing_coalition?: string[];
  winningCoalition?: string[];
  opposingCoalition?: string[];
  political_tensions?: number;
  politicalTensions?: number;
  tensionLevel?: number;
  delayed_consequences?: Array<{ id?: string; description: string; activates_in?: number; fireAtRound?: number }>;
  delayedConsequences?: Array<{ id?: string; description: string; activates_in?: number; fireAtRound?: number }>;
  history?: Array<{ round: number; event: string; decision: string; outcome: string; narrative: string }>;
  round?: number;
  simulationRound?: number;
  [k: string]: any;
}

export const startupCreate = async (input: StartupCreateInput) => {
  const raw = await post<unknown>(API.startupCreate, toBackendCreatePayload(input));
  if (isWarRoomResponse(raw)) return normalizeWarRoomResponse(raw);
  return normalizeWarRoomResponse(raw);
};

export const warRoomEvent = async (input: { startup_id?: string; event: string; world_state?: WorldState }) => {
  const world = input.world_state;
  if (!world) throw new Error("world_state required");
  const raw = await post<unknown>(API.warRoom, toBackendEventPayload(world, input.event));
  if (isWarRoomResponse(raw)) return normalizeWarRoomResponse(raw);
  return normalizeWarRoomResponse(raw);
};

export const timelapseFetch = async (input: { world_state?: WorldState; months?: number }) => {
  const world = input.world_state;
  if (!world) throw new Error("world_state required");
  const raw = await post<unknown>(API.timelapse, toBackendTimelapsePayload(world, input.months ?? 6));
  return { rounds: normalizeTimelapseResponse(raw), raw };
};
