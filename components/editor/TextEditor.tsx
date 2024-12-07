import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { Analysis } from "@/types/analysis";
import { useEffect, useState } from "react";

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to ensure array type
function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

export function TextEditor() {
  const [text, setText] = useState("");
  const { currentAnalysis, setCurrentAnalysis, addToHistory } = useAnalysisStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset analysis when text is cleared
  useEffect(() => {
    if (!text.trim()) {
      setCurrentAnalysis(null);
    }
  }, [text, setCurrentAnalysis]);

  // Update text when currentAnalysis changes
  useEffect(() => {
    if (currentAnalysis?.originalText) {
      setText(currentAnalysis.originalText);
    } else if (!currentAnalysis) {
      // Clear text when currentAnalysis is null (e.g., after deletion)
      setText("");
    }
  }, [currentAnalysis]);

  const handleAnalyze = async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    const analysisId = generateUUID();

    try {
      setCurrentAnalysis({ 
        id: analysisId,
        timestamp: Date.now(),
        status: "loading" 
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      console.log('Raw API Response:', JSON.stringify(data, null, 2));

      if (!data?.analysis?.raw_analysis) {
        console.error('Invalid API response:', data);
        throw new Error("Invalid API response format");
      }

      const { raw_analysis } = data.analysis;
      const { argument_structure: args, user_guidance: guide } = raw_analysis;
      
      // Transform API response to our analysis structure
      const transformedAnalysis: Analysis = {
        broader_context: guide?.broader_context || "",
        claims: ensureArray(args.claims).map((claim, index) => ({
          text: `${claim.id || `C${index + 1}`}: ${claim.text}` || ""
        })),
        evidence_and_support: ensureArray(args.evidence_and_support).map((evidence, index) => ({
          text: `${evidence.id || `E${index + 1}`}: ${evidence.text}` || "",
          type: evidence.type || "Evidence",
          supports: evidence.supports || ""
        })),
        analogies: ensureArray(args.analogies).map((analogy, index) => ({
          comparison: `${analogy.id || `A${index + 1}`}: ${analogy.comparison}` || "",
          implication: analogy.implication || ""
        })),
        inferences: ensureArray(args.inferences).map((inference, index) => ({
          text: `${inference.id || `I${index + 1}`}: ${inference.text}` || ""
        })),
        relationships: ensureArray(args.relationships).map(rel => ({
          type: rel.type || "",
          from: rel.from || "",
          to: rel.to || "",
          description: rel.description || ""
        }))
      };

      console.log('Transformed Analysis:', JSON.stringify(transformedAnalysis, null, 2));

      const analysisState = {
        id: analysisId,
        timestamp: Date.now(),
        status: "success" as const,
        sections: transformedAnalysis,
        raw_analysis,
        originalText: text
      };

      console.log('Final Analysis State:', JSON.stringify(analysisState, null, 2));

      setCurrentAnalysis(analysisState);
      addToHistory(analysisState);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      setCurrentAnalysis({
        id: analysisId,
        timestamp: Date.now(),
        status: "error",
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Text Editor</h2>
        <p className="text-sm text-gray-500">Enter your text to analyze ideas and relationships</p>
      </div>
      <div className="flex-1 p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here to analyze..."
          className="h-full min-h-[300px] resize-none bg-white text-gray-900 p-4 rounded-lg border-gray-200 focus:border-gray-300 focus:ring-gray-300"
        />
      </div>
      <div className="px-4 py-3 border-t border-gray-200">
        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>Analyze</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
