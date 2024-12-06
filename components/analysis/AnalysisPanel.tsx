import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAnalysisStore } from "@/lib/store/useAnalysisStore";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, AlignLeft, Edit2, Save } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import _ from "lodash";

export function AnalysisPanel() {
  const { currentAnalysis, updateAnalysis } = useAnalysisStore();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (currentAnalysis?.sections) {
      // Server-side logging
      console.log('\n=== ANALYSIS PANEL DATA ===');
      console.log('Full Analysis Object:', JSON.stringify(currentAnalysis, null, 2));
      console.log('\n=== SECTIONS BREAKDOWN ===');
      console.log('Core Ideas:', JSON.stringify(currentAnalysis.sections?.core_ideas, null, 2));
      console.log('Relationships Between Main Ideas:', JSON.stringify(currentAnalysis.sections?.relationships_between_main_ideas, null, 2));
      console.log('Relationships:', JSON.stringify(currentAnalysis.sections?.relationships, null, 2));
      console.log('Analogies:', JSON.stringify(currentAnalysis.sections?.analogies, null, 2));
      console.log('Updated Insights:', JSON.stringify(currentAnalysis.sections?.insights, null, 2));
      console.log('\n=== END ANALYSIS PANEL DATA ===\n');
    }
  }, [currentAnalysis]);

  // Debounced save function
  const debouncedSave = useCallback(
    _.debounce((id: string, updates: any) => {
      updateAnalysis(id, updates);
    }, 1000),
    []
  );

  const handleEdit = (sectionId: string, content: string) => {
    setEditingSection(sectionId);
    setEditContent(content);
  };

  const handleSave = (sectionId: string) => {
    if (!currentAnalysis) return;
    
    const [mainSection, subSection] = sectionId.split('.');
    const updates = {
      sections: {
        ...currentAnalysis.sections,
        [mainSection]: {
          ...currentAnalysis.sections[mainSection],
          [subSection]: editContent,
        },
      },
    };
    
    updateAnalysis(currentAnalysis.id, updates);
    setEditingSection(null);
  };

  const handleContentChange = (content: string) => {
    setEditContent(content);
    if (currentAnalysis && editingSection) {
      const [mainSection, subSection] = editingSection.split('.');
      const updates = {
        sections: {
          ...currentAnalysis.sections,
          [mainSection]: {
            ...currentAnalysis.sections[mainSection],
            [subSection]: content,
          },
        },
      };
      debouncedSave(currentAnalysis.id, updates);
    }
  };

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

  const renderEditableContent = (sectionId: string, content: string) => {
    const isEditing = editingSection === sectionId;
    
    return (
      <div className="relative">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[100px] w-full"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSection(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave(sectionId)}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className="whitespace-pre-wrap text-gray-900">{content}</div>
            <div className="absolute right-0 top-0 hidden space-x-2 group-hover:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(sectionId, content)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySection(content)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  console.log("Current Analysis:", currentAnalysis);
  console.log("Core Ideas:", currentAnalysis.sections?.core_ideas);
  console.log("Relationships Between Main Ideas:", currentAnalysis.sections?.relationships_between_main_ideas);
  console.log("Relationships:", currentAnalysis.sections?.relationships);
  console.log("Analogies:", currentAnalysis.sections?.analogies);
  console.log("Updated Insights:", currentAnalysis.sections?.insights);

  const sections = [
    {
      id: "core-ideas",
      title: "Core Ideas",
      subsections: [
        { 
          title: "Main Ideas", 
          data: currentAnalysis?.sections?.core_ideas?.main_ideas || [],
          renderItem: (item: any) => renderEditableContent(
            "CoreIdeas.MainIdeas",
            `[${item.id}] ${item.content}`
          )
        },
        { 
          title: "Supporting Ideas", 
          data: currentAnalysis?.sections?.core_ideas?.supporting_ideas || [],
          renderItem: (item: any) => renderEditableContent(
            "CoreIdeas.SupportingIdeas",
            `[For ${item.main_idea_id}] ${item.content}`
          )
        },
        { 
          title: "Contextual Elements", 
          data: currentAnalysis?.sections?.core_ideas?.contextual_elements || [],
          renderItem: (item: any) => renderEditableContent(
            "CoreIdeas.ContextualElements",
            `[${item.id}] ${item.content}`
          )
        },
        { 
          title: "Counterpoints", 
          data: currentAnalysis?.sections?.core_ideas?.counterpoints || [],
          renderItem: (item: any) => renderEditableContent(
            "CoreIdeas.Counterpoints",
            `[For ${item.main_idea_id}] ${item.content}`
          )
        },
        {
          title: "Relationships Between Ideas",
          data: currentAnalysis?.sections?.core_ideas?.relationships_between_main_ideas || [],
          renderItem: (item: any) => renderEditableContent(
            "CoreIdeas.RelationshipsBetweenMainIdeas",
            `[${item.type}] ${item.idea1} → ${item.idea2}: ${item.description}`
          )
        }
      ],
    },
    {
      id: "relationships",
      title: "General Relationships",
      data: currentAnalysis?.sections?.relationships?.items || [],
      renderItem: (item: any) => renderEditableContent(
        "Relationships",
        `[${item.type}] ${item.description}`
      )
    },
    {
      id: "analogies",
      title: "Analogies",
      data: currentAnalysis?.sections?.analogies?.items || [],
      renderItem: (item: any) => renderEditableContent(
        "Analogies",
        `[${item.id}] ${item.comparison}\nSupport: ${item.support}\nImplications: ${item.implications}`
      )
    },
    {
      id: "insights",
      title: "Generated Insights",
      subsections: [
        {
          title: "Evolution of Ideas",
          data: currentAnalysis?.sections?.insights?.evolution ? [currentAnalysis.sections.insights.evolution] : [],
          renderItem: (item: any) => renderEditableContent("Insights.Evolution", item)
        },
        {
          title: "Key Takeaways",
          data: currentAnalysis?.sections?.insights?.key_takeaways ? [currentAnalysis.sections.insights.key_takeaways] : [],
          renderItem: (item: any) => renderEditableContent("Insights.KeyTakeaways", item)
        },
        {
          title: "Tradeoffs/Risks",
          data: currentAnalysis?.sections?.insights?.tradeoffs ? [currentAnalysis.sections.insights.tradeoffs] : [],
          renderItem: (item: any) => renderEditableContent("Insights.Tradeoffs", item)
        },
        {
          title: "Broader Themes",
          data: currentAnalysis?.sections?.insights?.broader_themes ? [currentAnalysis.sections.insights.broader_themes] : [],
          renderItem: (item: any) => renderEditableContent("Insights.BroaderThemes", item)
        }
      ]
    }
  ];

  return (
    <div className="flex h-full w-full flex-col gap-4 bg-white">
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
                        <div className="space-y-3">
                          {subsection.data.map((item: any, index: number) => (
                            <div key={index} className="rounded-lg bg-gray-50 p-3">
                              {subsection.renderItem(item)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-3">
                      {Array.isArray(section.data) && section.data.map((item: any, index: number) => (
                        <div key={index} className="rounded-lg bg-gray-50 p-3">
                          {section.renderItem(item)}
                        </div>
                      ))}
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
