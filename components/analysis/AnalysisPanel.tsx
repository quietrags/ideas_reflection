import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, AlignLeft } from "lucide-react";

export function AnalysisPanel() {
  const { currentAnalysis } = useAnalysisStore();

  if (!currentAnalysis) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <AlignLeft className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">
            Enter text and click Analyze<br />to get started
          </p>
        </div>
      </div>
    );
  }

  if (currentAnalysis.status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-900" />
          <p className="mt-2 text-sm text-gray-400">Analyzing your ideas...</p>
        </div>
      </div>
    );
  }

  if (currentAnalysis.status === "error") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-center text-sm text-red-500">
          {currentAnalysis.error || "An error occurred during analysis"}
        </p>
      </div>
    );
  }

  const copySection = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const sections = [
    {
      id: "core-ideas",
      title: "Core Ideas",
      subsections: [
        { 
          title: "Main Ideas", 
          data: currentAnalysis.sections?.core_ideas?.main_ideas || [],
          renderItem: (item: any) => `[${item.id}] ${item.content}`
        },
        { 
          title: "Supporting Ideas", 
          data: currentAnalysis.sections?.core_ideas?.supporting_ideas || [],
          renderItem: (item: any) => `[For ${item.main_idea_id}] ${item.content}`
        },
        { 
          title: "Contextual Elements", 
          data: currentAnalysis.sections?.core_ideas?.contextual_elements || [],
          renderItem: (item: any) => `[${item.id}] ${item.content}`
        },
        { 
          title: "Counterpoints", 
          data: currentAnalysis.sections?.core_ideas?.counterpoints || [],
          renderItem: (item: any) => `[For ${item.main_idea_id}] ${item.content}`
        },
        {
          title: "Relationships Between Main Ideas",
          data: currentAnalysis.sections?.core_ideas?.relationships_between_main_ideas || [],
          renderItem: (item: any) => `${item.idea1} ${item.type} ${item.idea2}: ${item.description}`
        }
      ],
    },
    {
      id: "relationships",
      title: "Relationships",
      data: currentAnalysis.sections?.relationships?.items || [],
      renderItem: (item: any) => `[${item.type}] ${item.description}`
    },
    {
      id: "analogies",
      title: "Analogies",
      data: currentAnalysis.sections?.analogies?.items || [],
      renderItem: (item: any) => (
        `[${item.id}]\nComparison: ${item.comparison}\nSupport: ${item.support}\nImplications: ${item.implications}`
      )
    },
    {
      id: "insights",
      title: "Insights",
      subsections: [
        {
          title: "Evolution of Ideas",
          data: [currentAnalysis.sections?.insights?.evolution || ""],
        },
        {
          title: "Key Takeaways",
          data: [currentAnalysis.sections?.insights?.key_takeaways || ""],
        },
        {
          title: "Trade-offs & Risks",
          data: [currentAnalysis.sections?.insights?.tradeoffs || ""],
        },
        {
          title: "Broader Themes",
          data: [currentAnalysis.sections?.insights?.broader_themes || ""],
        }
      ],
    },
  ];

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Idea Analysis</h2>
          <p className="text-sm text-gray-500">Here's what we found in your text.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          onClick={() => copySection(currentAnalysis.sections?.raw_analysis || "")}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy All
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <Accordion type="single" collapsible className="space-y-2">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-lg border border-gray-200 bg-white px-4"
            >
              <AccordionTrigger className="text-sm font-semibold text-gray-900 hover:text-gray-700 [&[data-state=open]]:text-gray-900">
                {section.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {section.subsections ? (
                    section.subsections.map((subsection) => (
                      <div key={subsection.title} className="space-y-2">
                        <h4 className="font-medium text-gray-700">{subsection.title}</h4>
                        <div className="relative rounded bg-gray-50 p-3">
                          {subsection.data.length > 0 ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-2 h-6 w-6 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => copySection(subsection.data.join("\n"))}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <ul className="space-y-2 pr-8 text-sm text-gray-700">
                                {subsection.data.map((item: any, index: number) => (
                                  <li key={index}>
                                    {subsection.renderItem ? subsection.renderItem(item) : item}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">No data available</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative rounded bg-gray-50 p-3">
                      {section.data.length > 0 ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-6 w-6 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => copySection(section.data.join("\n"))}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <ul className="space-y-2 pr-8 text-sm text-gray-700">
                            {section.data.map((item: any, index: number) => (
                              <li key={index}>
                                {section.renderItem ? section.renderItem(item) : item}
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No data available</p>
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
