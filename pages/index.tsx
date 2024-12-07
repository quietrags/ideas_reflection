import { MainLayout } from "@/components/layout/MainLayout";
import { TextEditor } from "@/components/editor/TextEditor";
import AnalysisPanel from "@/components/analysis/AnalysisPanel";
import { useAnalysisStore } from "@/lib/store/useAnalysisStore";

export default function Home() {
  const { currentAnalysis } = useAnalysisStore();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <MainLayout
        leftPanel={<TextEditor />}
        rightPanel={<AnalysisPanel />}
      />
    </div>
  );
}
