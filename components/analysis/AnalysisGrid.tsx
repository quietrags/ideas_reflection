import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { ThumbsUp, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function AnalysisGrid() {
  const { analysisHistory, removeFromHistory } = useAnalysisStore();

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "some time ago";
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
        {analysisHistory.map((analysis) => (
          <div
            key={analysis.id}
            className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{getTimeAgo(analysis.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
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
                  onClick={() => removeFromHistory(analysis.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="line-clamp-3 text-sm text-gray-700">
              {analysis.input}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {Object.keys(analysis.sections).length} sections analyzed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
