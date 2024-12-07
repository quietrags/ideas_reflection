import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";

export function AnalysisGrid() {
  const { analysisHistory, removeFromHistory, setCurrentAnalysis } = useAnalysisStore();

  if (!analysisHistory || analysisHistory.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No analysis history</h3>
          <p className="mt-1 text-sm text-gray-500">Your past analyses will appear here.</p>
        </div>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromHistory(id);
  };

  const handleLoad = (analysis: any) => {
    setCurrentAnalysis(analysis);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {analysisHistory.map((analysis) => (
        <Card 
          key={analysis.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleLoad(analysis)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(analysis.timestamp, { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    analysis.status === "success"
                      ? "bg-green-100 text-green-800"
                      : analysis.status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {analysis.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                  onClick={(e) => handleDelete(e, analysis.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-900 line-clamp-3">
                {analysis.originalText}
              </p>
              {analysis.sections?.claims && analysis.sections.claims.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {analysis.sections.claims.slice(0, 2).map((claim, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      {claim.text.length > 50 ? `${claim.text.slice(0, 50)}...` : claim.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <ExternalLink className="h-4 w-4 mr-1" />
              Click to load analysis
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
