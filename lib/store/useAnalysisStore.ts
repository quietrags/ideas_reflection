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
  lastModified?: number;
}

interface AnalysisStore {
  currentAnalysis: Analysis | null;
  selectedAnalysis: Analysis | null;
  analysisHistory: Analysis[];
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  setSelectedAnalysis: (analysis: Analysis | null) => void;
  addToHistory: (analysis: Analysis) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  updateAnalysis: (id: string, updates: Partial<Analysis>) => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      currentAnalysis: null,
      selectedAnalysis: null,
      analysisHistory: [],
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      setSelectedAnalysis: (analysis) => set({ selectedAnalysis: analysis }),
      addToHistory: (analysis) =>
        set((state) => ({
          analysisHistory: [analysis, ...state.analysisHistory],
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          analysisHistory: state.analysisHistory.filter((a) => a.id !== id),
          selectedAnalysis: state.selectedAnalysis?.id === id ? null : state.selectedAnalysis,
          currentAnalysis: state.currentAnalysis?.id === id ? null : state.currentAnalysis,
        })),
      clearHistory: () => set({ 
        analysisHistory: [], 
        selectedAnalysis: null,
        currentAnalysis: null 
      }),
      updateAnalysis: (id, updates) =>
        set((state) => {
          const updatedHistory = state.analysisHistory.map((analysis) =>
            analysis.id === id
              ? { ...analysis, ...updates, lastModified: Date.now() }
              : analysis
          );
          
          return {
            analysisHistory: updatedHistory,
            selectedAnalysis:
              state.selectedAnalysis?.id === id
                ? { ...state.selectedAnalysis, ...updates, lastModified: Date.now() }
                : state.selectedAnalysis,
          };
        }),
    }),
    {
      name: "analysis-store",
    }
  )
);
