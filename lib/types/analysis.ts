export interface AnalysisSection {
  title: string;
  content: string;
}

export interface Analysis {
  id: string;
  input: string;
  timestamp: string;
  sections: {
    section1: AnalysisSection;
    section2: AnalysisSection;
    section3: AnalysisSection;
    section4: AnalysisSection;
  };
  status: 'idle' | 'loading' | 'complete' | 'error';
  error?: string;
}

export interface AnalysisStore {
  currentAnalysis: Analysis | null;
  history: Analysis[];
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  addToHistory: (analysis: Analysis) => void;
  updateAnalysisStatus: (id: string, status: Analysis['status'], error?: string) => void;
}
