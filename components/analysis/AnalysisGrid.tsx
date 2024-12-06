import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { ThumbsUp, Trash2, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function AnalysisGrid() {
  const { 
    analysisHistory, 
    removeFromHistory, 
    selectedAnalysis,
    setSelectedAnalysis,
    setCurrentAnalysis 
  } = useAnalysisStore();

  const getTimeAgo = (timestamp: number) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  const handleAnalysisSelect = (analysis: any) => {
    console.log("Selected Analysis:", analysis);
    setSelectedAnalysis(analysis);
    setCurrentAnalysis(analysis);  
  };

  const handleDelete = (e: React.MouseEvent, analysisId: string) => {
    e.stopPropagation();
    removeFromHistory(analysisId);
    
    // If this was the last item, explicitly clear both states
    if (analysisHistory.length <= 1) {
      setSelectedAnalysis(null);
      setCurrentAnalysis(null);
    }
  };

  if (analysisHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Past Analyses</h2>
        <p className="text-sm text-gray-500">Your previous idea analyses</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {analysisHistory.map((analysis) => {
          const isSelected = selectedAnalysis?.id === analysis.id;
          
          return (
            <div
              key={analysis.id}
              onClick={() => handleAnalysisSelect(analysis)}
              className={cn(
                "group relative cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all",
                isSelected 
                  ? "border-blue-500 ring-2 ring-blue-500/20" 
                  : "border-gray-200 hover:shadow-md"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeAgo(analysis.timestamp)}</span>
                  {analysis.lastModified && (
                    <span className="text-xs text-gray-400">
                      (edited {getTimeAgo(analysis.lastModified)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 text-gray-400 hover:text-green-500"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 text-gray-400 hover:text-red-500"
                    onClick={(e) => handleDelete(e, analysis.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="line-clamp-3 text-sm text-gray-700">
                {analysis.text}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {Object.keys(analysis.sections || {}).length} sections analyzed
                </span>
                {isSelected && (
                  <span className="text-blue-500">Currently viewing</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
