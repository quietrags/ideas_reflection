import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Analysis, RawAnalysis } from "@/types/analysis";

interface AnalysisState {
  id: string;
  timestamp: number;
  status: "idle" | "loading" | "success" | "error";
  sections?: Analysis;
  raw_analysis?: RawAnalysis;
  error?: string;
  originalText?: string;
}

interface AnalysisStore {
  currentAnalysis: AnalysisState | null;
  selectedAnalysis: AnalysisState | null;
  analysisHistory: AnalysisState[];
  setCurrentAnalysis: (analysis: AnalysisState | null) => void;
  setSelectedAnalysis: (analysis: AnalysisState | null) => void;
  addToHistory: (analysis: AnalysisState) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  updateAnalysis: (id: string, updates: Partial<AnalysisState>) => void;
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
          analysisHistory: [
            {
              ...analysis,
              timestamp: Date.now(),
            },
            ...state.analysisHistory,
          ].slice(0, 10), // Keep only the last 10 analyses
        })),
      removeFromHistory: (id) =>
        set((state) => {
          // Check if the deleted item is currently being displayed
          const shouldClearCurrent = state.currentAnalysis?.id === id;
          const shouldClearSelected = state.selectedAnalysis?.id === id;
          
          return {
            analysisHistory: state.analysisHistory.filter((a) => a.id !== id),
            // Clear current and selected analysis if they match the deleted item
            ...(shouldClearCurrent && { currentAnalysis: null }),
            ...(shouldClearSelected && { selectedAnalysis: null })
          };
        }),
      clearHistory: () =>
        set({
          analysisHistory: [],
          selectedAnalysis: null,
          currentAnalysis: null // Also clear the current analysis when clearing history
        }),
      updateAnalysis: (id, updates) =>
        set((state) => {
          const updatedHistory = state.analysisHistory.map((analysis) =>
            analysis.id === id ? { ...analysis, ...updates } : analysis
          );
          
          // Also update current and selected analysis if they match
          const updatedCurrent = state.currentAnalysis?.id === id
            ? { ...state.currentAnalysis, ...updates }
            : state.currentAnalysis;
            
          const updatedSelected = state.selectedAnalysis?.id === id
            ? { ...state.selectedAnalysis, ...updates }
            : state.selectedAnalysis;

          return {
            analysisHistory: updatedHistory,
            currentAnalysis: updatedCurrent,
            selectedAnalysis: updatedSelected,
          };
        }),
    }),
    {
      name: "analysis-store",
      version: 3,
    }
  )
);
