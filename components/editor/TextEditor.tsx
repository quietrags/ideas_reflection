import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function TextEditor() {
  const [input, setInput] = useState("");
  const { currentAnalysis, setCurrentAnalysis, addToHistory } = useAnalysisStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentAnalysis) {
      setInput(currentAnalysis.text);
    } else {
      setInput("");  // Clear input when there's no current analysis
    }
  }, [currentAnalysis]);

  const handleAnalyze = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const analysisId = generateUUID();

    try {
      const analysis = {
        id: analysisId,
        timestamp: Date.now(),
        text: input,
        status: "loading" as const,
        sections: {
          core_ideas: {
            main_ideas: [],
            supporting_ideas: [],
            contextual_elements: [],
            counterpoints: []
          },
          relationships: [],
          analogies: [],
          insights: [],
          raw_analysis: ""
        }
      };

      setCurrentAnalysis(analysis);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to analyze text. Please try again.";
        if (response.status === 429) {
          errorMessage = data.message || "Rate limit exceeded. Please try again in a few minutes.";
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      const updatedAnalysis = {
        ...analysis,
        status: "success" as const,
        sections: data.analysis
      };

      setCurrentAnalysis(updatedAnalysis);
      addToHistory(updatedAnalysis);
    } catch (error) {
      console.error("Analysis error:", error);
      setCurrentAnalysis({
        id: analysisId,
        timestamp: Date.now(),
        text: input,
        status: "error" as const,
        error: error instanceof Error ? error.message : "Failed to analyze text. Please try again.",
        sections: {
          core_ideas: {
            main_ideas: [],
            supporting_ideas: [],
            contextual_elements: [],
            counterpoints: []
          },
          relationships: [],
          analogies: [],
          insights: [],
          raw_analysis: ""
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Complex text here</h2>
        <p className="text-sm text-gray-500">Enter your text below and click analyze to get insights.</p>
      </div>
      <div className="relative flex-1">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          className="absolute inset-0 resize-none rounded-lg border-gray-200 bg-white p-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-gray-900"
        />
      </div>
      <Button
        onClick={handleAnalyze}
        disabled={!input.trim() || isLoading}
        className="relative overflow-hidden rounded-lg bg-black px-4 py-2 text-base font-medium text-white transition-all hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400"
      >
        <ArrowRight className="mr-2 h-4 w-4" />
        {isLoading ? "Analyzing..." : "Analyze"}
      </Button>
    </div>
  );
}
