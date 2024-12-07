import { ReactNode } from 'react';
import Split from 'react-split';
import { TextEditor } from "../editor/TextEditor";
import AnalysisPanel from "../analysis/AnalysisPanel";
import { AnalysisGrid } from "../analysis/AnalysisGrid";

interface MainLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function MainLayout({ leftPanel, rightPanel }: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl p-4">
        <Split
          className="flex h-[calc(100vh-8rem)]"
          sizes={[50, 50]}
          minSize={400}
          gutterStyle={() => ({
            width: "8px",
            backgroundColor: "#e5e7eb",
            margin: "0 -4px",
            cursor: "col-resize",
          })}
        >
          <div className="flex flex-col min-w-[400px] rounded-lg bg-white shadow-sm overflow-hidden">
            {leftPanel}
          </div>
          <div className="flex flex-col min-w-[400px] rounded-lg bg-white shadow-sm overflow-hidden">
            {rightPanel}
          </div>
        </Split>
        <div className="mt-4 rounded-lg bg-white shadow-sm p-4">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">Analysis History</h2>
            <p className="text-sm text-gray-500">View and manage your previous analyses</p>
          </div>
          <div className="mt-4">
            <AnalysisGrid />
          </div>
        </div>
      </div>
    </main>
  );
}
