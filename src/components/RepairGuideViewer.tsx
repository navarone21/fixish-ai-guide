import { useState } from "react";
import { Volume2, VolumeX, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RepairStep } from "@/components/RepairStep";
import { SafetyWarning } from "@/components/SafetyWarning";
import { ToolRecommendations } from "@/components/ToolRecommendations";
import { ConfidenceScore } from "@/components/ConfidenceScore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface RepairGuideViewerProps {
  content: string;
  userId?: string;
  onSave?: () => void;
}

export const RepairGuideViewer = ({ content, userId, onSave }: RepairGuideViewerProps) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentStepAudio, setCurrentStepAudio] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Parse repair guide from markdown content
  const parseRepairGuide = () => {
    const lines = content.split('\n');
    const guide: any = {
      title: "",
      steps: [],
      safety: [],
      tools: [],
      confidence: null,
    };

    let currentSection = "";
    let currentStep = "";

    for (const line of lines) {
      // Extract title (first heading)
      if (line.startsWith('# ') && !guide.title) {
        guide.title = line.replace('# ', '').trim();
      }
      
      // Extract confidence score
      if (line.toLowerCase().includes('confidence:')) {
        const match = line.match(/confidence:\s*(0?\.\d+|\d+%)/i);
        if (match) {
          const confValue = match[1];
          guide.confidence = confValue.includes('%') 
            ? parseInt(confValue) / 100 
            : parseFloat(confValue);
        }
      }

      // Identify sections
      if (line.toLowerCase().includes('safety') || line.toLowerCase().includes('⚠️')) {
        currentSection = "safety";
      } else if (line.toLowerCase().includes('tools') || line.toLowerCase().includes('materials')) {
        currentSection = "tools";
      } else if (line.toLowerCase().includes('step') || /^\d+\./.test(line.trim())) {
        currentSection = "steps";
      }

      // Parse safety warnings
      if (currentSection === "safety" && (line.startsWith('- ') || line.startsWith('* '))) {
        const text = line.replace(/^[-*]\s*/, '').trim();
        if (text) {
          const level = text.toLowerCase().includes('critical') || text.toLowerCase().includes('danger')
            ? 'critical'
            : text.toLowerCase().includes('warning') || text.toLowerCase().includes('caution')
            ? 'warning'
            : 'info';
          guide.safety.push({ text, level });
        }
      }

      // Parse tools
      if (currentSection === "tools" && (line.startsWith('- ') || line.startsWith('* '))) {
        const text = line.replace(/^[-*]\s*/, '').trim();
        if (text) {
          const type = text.toLowerCase().includes('screw') || text.toLowerCase().includes('hammer')
            ? 'tool'
            : text.toLowerCase().includes('glue') || text.toLowerCase().includes('tape')
            ? 'material'
            : 'part';
          guide.tools.push({ name: text, type, required: !text.toLowerCase().includes('optional') });
        }
      }

      // Parse steps
      if (currentSection === "steps") {
        const stepMatch = line.match(/^(\d+)\.\s*(.+)/);
        if (stepMatch) {
          if (currentStep) {
            guide.steps.push({ title: currentStep, content: "" });
          }
          currentStep = stepMatch[2].trim();
        }
      }
    }

    // Add last step
    if (currentStep) {
      guide.steps.push({ title: currentStep, content: "" });
    }

    return guide;
  };

  const guide = parseRepairGuide();
  const hasStructuredData = guide.steps.length > 0 || guide.safety.length > 0 || guide.tools.length > 0;

  const handleNarrate = async (text: string, stepIndex?: number) => {
    if (isNarrating && currentStepAudio === stepIndex) {
      // Stop current narration
      setIsNarrating(false);
      setCurrentStepAudio(null);
      window.speechSynthesis.cancel();
      return;
    }

    try {
      setIsNarrating(true);
      setCurrentStepAudio(stepIndex ?? null);

      // Call text-to-speech edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Convert base64 to audio and play
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsNarrating(false);
          setCurrentStepAudio(null);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsNarrating(false);
          setCurrentStepAudio(null);
          toast({
            title: "Audio playback failed",
            description: "Could not play audio",
            variant: "destructive",
          });
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Narration error:', error);
      setIsNarrating(false);
      setCurrentStepAudio(null);
      toast({
        title: "Narration failed",
        description: "Could not generate voice guidance",
        variant: "destructive",
      });
    }
  };

  const handleSaveProject = async () => {
    if (!userId) {
      toast({
        title: "Cannot save",
        description: "User ID not available",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save to repair_projects table
      await supabase.rpc('set_user_context', { p_user_id: userId });
      
      const { error } = await supabase.from('repair_projects').insert({
        user_id: userId,
        title: guide.title || "Repair Project",
        description: content.slice(0, 500),
        status: "in_progress",
        confidence_score: guide.confidence,
        tools_used: guide.tools.map((t: any) => t.name),
        notes: content,
      });

      if (error) throw error;

      toast({
        title: "Project saved",
        description: "Repair guide saved to your history",
      });

      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "Could not save repair project",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasStructuredData) {
    return null; // Don't render if no structured data found
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 my-6"
    >
      {/* Header with title and actions */}
      {guide.title && (
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground">{guide.title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNarrate(content)}
              disabled={isNarrating && currentStepAudio === null}
            >
              {isNarrating && currentStepAudio === null ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            {userId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProject}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {guide.confidence !== null && (
        <ConfidenceScore score={guide.confidence} />
      )}

      {/* Safety Warnings */}
      {guide.safety.length > 0 && (
        <div className="space-y-2">
          {guide.safety.map((warning: any, idx: number) => (
            <SafetyWarning
              key={idx}
              level={warning.level}
              message={warning.text}
            />
          ))}
        </div>
      )}

      {/* Tools & Materials */}
      {guide.tools.length > 0 && (
        <ToolRecommendations tools={guide.tools} />
      )}

      {/* Repair Steps */}
      {guide.steps.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">Repair Steps</h3>
          <AnimatePresence>
            {guide.steps.map((step: any, idx: number) => (
              <RepairStep
                key={idx}
                number={idx + 1}
                title={step.title}
                content={step.content || "Follow this step carefully."}
                onNarrate={() => handleNarrate(step.title, idx)}
                isNarrating={isNarrating && currentStepAudio === idx}
              />
            ))}
          </AnimatePresence>
        </Card>
      )}
    </motion.div>
  );
};
