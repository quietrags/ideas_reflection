import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CoreIdeas {
  main_ideas: string[];
  supporting_ideas: string[];
  contextual_elements: string[];
  counterpoints: string[];
}

interface Analysis {
  id: string;
  timestamp: number;
  text: string;
  sections: {
    core_ideas: CoreIdeas;
    relationships: string[];
    analogies: string[];
    insights: string[];
    raw_analysis: string;
  };
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

interface AnalysisStore {
  currentAnalysis: Analysis | null;
  analysisHistory: Analysis[];
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  addToHistory: (analysis: Analysis) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      currentAnalysis: null,
      analysisHistory: [],
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      addToHistory: (analysis) =>
        set((state) => ({
          analysisHistory: [analysis, ...state.analysisHistory],
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          analysisHistory: state.analysisHistory.filter((a) => a.id !== id),
        })),
      clearHistory: () => set({ analysisHistory: [] }),
    }),
    {
      name: "analysis-store",
    }
  )
);
