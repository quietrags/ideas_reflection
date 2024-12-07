import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

export default function AnalysisPanel() {
  const { currentAnalysis } = useAnalysisStore();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = async (text: string, sectionId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const renderEmptyState = () => (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div className="rounded-full bg-blue-50 p-3 mb-4">
        <svg
          className="h-6 w-6 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Ready to Analyze Your Ideas
      </h3>
      <p className="text-gray-500 max-w-sm">
        Enter your text in the editor and click "Analyze" to get detailed insights about the ideas and their relationships.
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">Analyzing your ideas...</p>
    </div>
  );

  const renderErrorState = (error: string) => (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div className="rounded-full bg-red-50 p-3 mb-4">
        <svg
          className="h-6 w-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">Analysis Failed</h3>
      <p className="text-gray-500">{error}</p>
    </div>
  );

  const renderCopyButton = (text: string, sectionId: string) => (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent accordion from toggling
        handleCopy(text, sectionId);
      }}
      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copiedSection === sectionId ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <CopyIcon className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
        <p className="text-sm text-gray-500">Explore the structured breakdown of your ideas</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!currentAnalysis && renderEmptyState()}
        {currentAnalysis?.status === "loading" && renderLoadingState()}
        {currentAnalysis?.status === "error" && renderErrorState(currentAnalysis.error || "An unexpected error occurred")}
        {currentAnalysis?.status === "success" && currentAnalysis.sections && (
          <div className="p-4">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="context" className="border rounded-lg overflow-hidden bg-white">
                <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:bg-gray-50">
                  <div className="flex items-center justify-between w-full text-gray-900">
                    <span className="font-semibold">The broad context of the article</span>
                    {renderCopyButton(currentAnalysis.sections.broader_context, "context")}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <p className="text-sm text-gray-700">{currentAnalysis.sections.broader_context}</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="claims" className="border rounded-lg overflow-hidden bg-white">
                <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:bg-gray-50">
                  <div className="flex items-center justify-between w-full text-gray-900">
                    <span className="font-semibold">Important claims being made</span>
                    {renderCopyButton(JSON.stringify(currentAnalysis.sections.claims, null, 2), "claims")}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {Array.isArray(currentAnalysis.sections.claims) && currentAnalysis.sections.claims.map((claim, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{claim.text}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="evidence" className="border rounded-lg overflow-hidden bg-white">
                <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:bg-gray-50">
                  <div className="flex items-center justify-between w-full text-gray-900">
                    <span className="font-semibold">What evidence is being presented for the claims</span>
                    {renderCopyButton(JSON.stringify(currentAnalysis.sections.evidence_and_support, null, 2), "evidence")}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {Array.isArray(currentAnalysis.sections.evidence_and_support) && currentAnalysis.sections.evidence_and_support.map((evidence, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-600">{evidence.type}</p>
                        <p className="text-sm text-gray-700 mt-1">{evidence.text}</p>
                        <p className="text-sm text-gray-500 mt-1">Supports: {evidence.supports}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="analogies" className="border rounded-lg overflow-hidden bg-white">
                <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:bg-gray-50">
                  <div className="flex items-center justify-between w-full text-gray-900">
                    <span className="font-semibold">What analogies are being used</span>
                    {renderCopyButton(JSON.stringify(currentAnalysis.sections.analogies, null, 2), "analogies")}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {Array.isArray(currentAnalysis.sections.analogies) && currentAnalysis.sections.analogies.map((analogy, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{analogy.comparison}</p>
                        {analogy.implication && (
                          <p className="text-sm text-gray-600 mt-2">{analogy.implication}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="inferences" className="border rounded-lg overflow-hidden bg-white">
                <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:bg-gray-50">
                  <div className="flex items-center justify-between w-full text-gray-900">
                    <span className="font-semibold">What inferences are being drawn</span>
                    {renderCopyButton(JSON.stringify(currentAnalysis.sections.inferences, null, 2), "inferences")}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {Array.isArray(currentAnalysis.sections.inferences) && currentAnalysis.sections.inferences.map((inference, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{inference.text}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="relationships" className="border rounded-lg overflow-hidden bg-white">
                <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:bg-gray-50">
                  <div className="flex items-center justify-between w-full text-gray-900">
                    <span className="font-semibold">The relationships between ideas</span>
                    {renderCopyButton(JSON.stringify(currentAnalysis.sections.relationships, null, 2), "relationships")}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {Array.isArray(currentAnalysis.sections.relationships) && currentAnalysis.sections.relationships.map((rel, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-600">{rel.type}</p>
                        <p className="text-sm text-gray-700 mt-1">{rel.description}</p>
                        <p className="text-sm text-gray-500 mt-1">From: {rel.from} → To: {rel.to}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
