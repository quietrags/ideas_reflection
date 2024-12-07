// Analysis Structure
export interface Analysis {
  broader_context: string;
  claims: Array<{
    text: string;
  }>;
  evidence_and_support: Array<{
    text: string;
    type: string;
    supports: string;
  }>;
  analogies: Array<{
    comparison: string;
    implication: string;
  }>;
  inferences: Array<{
    text: string;
  }>;
  relationships: Array<{
    type: string;
    from: string;
    to: string;
    description: string;
  }>;
}

// Raw Analysis Structure from API
export interface RawAnalysis {
  argument_structure: {
    claims: Array<{
      id?: string;
      text: string;
    }>;
    evidence_and_support: Array<{
      id?: string;
      text: string;
      type: string;
      supports: string;
    }>;
    analogies: Array<{
      id?: string;
      comparison: string;
      implication: string;
    }>;
    inferences: Array<{
      id?: string;
      text: string;
    }>;
    relationships: Array<{
      type: string;
      from: string;
      to: string;
      description: string;
    }>;
  };
  user_guidance: {
    broader_context: string;
    how_to_read?: string[];
  };
}
