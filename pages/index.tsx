import { MainLayout } from "@/components/layout/MainLayout";
import { TextEditor } from "@/components/editor/TextEditor";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <MainLayout
        leftPanel={<TextEditor />}
        rightPanel={<AnalysisPanel />}
      />
    </div>
  );
}
