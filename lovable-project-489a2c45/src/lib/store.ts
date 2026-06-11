import { create } from "zustand";
import type { VentureAnalysis, WorldState } from "./api";

interface AppState {
  analysis: VentureAnalysis | null;
  setAnalysis: (a: VentureAnalysis | null) => void;
  chatHistory: { role: "user" | "assistant"; content: string }[];
  appendChat: (m: { role: "user" | "assistant"; content: string }) => void;
  resetChat: () => void;

  world: WorldState | null;
  setWorld: (w: WorldState | null) => void;
  rounds: WorldState[];
  pushRound: (w: WorldState) => void;
}

export const useApp = create<AppState>((set) => ({
  analysis: null,
  setAnalysis: (a) => set({ analysis: a }),
  chatHistory: [],
  appendChat: (m) => set((s) => ({ chatHistory: [...s.chatHistory, m] })),
  resetChat: () => set({ chatHistory: [] }),

  world: null,
  setWorld: (w) => set({ world: w }),
  rounds: [],
  pushRound: (w) => set((s) => ({ rounds: [...s.rounds, w] })),
}));
