import { ReactNode } from 'react';
import Split from 'react-split';
import { TextEditor } from "../editor/TextEditor";
import { AnalysisPanel } from "../analysis/AnalysisPanel";
import { AnalysisGrid } from "../analysis/AnalysisGrid";

interface MainLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function MainLayout({ leftPanel, rightPanel }: MainLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4">
        <Split
          className="flex h-[calc(100vh-20rem)] gap-4"
          sizes={[50, 50]}
          minSize={400}
          style={{
            display: "flex",
            gap: "1rem",
          }}
          gutterStyle={() => ({
            width: "8px",
            cursor: "col-resize",
            backgroundColor: "#f1f5f9"
          })}
        >
          <div className="flex min-w-[400px] flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-6 shadow-sm">
            {leftPanel}
          </div>
          <div className="flex min-w-[400px] flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-6 shadow-sm">
            {rightPanel}
          </div>
        </Split>
        <AnalysisGrid />
      </div>
    </main>
  );
}
