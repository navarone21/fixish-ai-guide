import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VoiceRecorder } from "@/components/VoiceRecorder";

interface FeedbackRatingProps {
  messageId: string;
  sessionId: string;
  isDarkMode: boolean;
}

export const FeedbackRating = ({ messageId, sessionId, isDarkMode }: FeedbackRatingProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (value: number) => {
    setRating(value);
    setShowTextInput(true);
  };

  const handleSubmit = async () => {
    if (rating === null) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("chat_feedback").insert({
        session_id: sessionId,
        message_id: messageId,
        rating: rating,
        feedback_text: feedbackText.trim() || null,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      setHasSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve Fix-ISH AI",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs"
        style={{ color: "#999999" }}
      >
        ✓ Thanks for your feedback!
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-1">
        <span className="text-xs mr-2" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
          Rate this response:
        </span>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRatingClick(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(null)}
            className="transition-transform hover:scale-110"
            disabled={isSubmitting}
          >
            <Star
              className="w-4 h-4"
              fill={
                (hoveredRating !== null ? value <= hoveredRating : value <= (rating || 0))
                  ? "#FFD700"
                  : "none"
              }
              style={{
                color:
                  (hoveredRating !== null ? value <= hoveredRating : value <= (rating || 0))
                    ? "#FFD700"
                    : "#999999",
              }}
            />
          </button>
        ))}
      </div>

      {showTextInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-70">Optional comment</span>
            <VoiceRecorder
              onTranscript={(text) => setFeedbackText((prev) => (prev ? prev + " " : "") + text)}
              isDarkMode={isDarkMode}
            />
          </div>
          <Textarea
            placeholder="Was this helpful? (optional)"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            maxLength={500}
            rows={2}
            className="text-xs resize-none"
            style={{
              background: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.8)",
              color: isDarkMode ? "#EAEAEA" : "#1A1C1E",
              borderColor: "rgba(0, 194, 178, 0.3)",
            }}
            disabled={isSubmitting}
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="sm"
            className="h-7 px-3 text-xs"
            style={{
              background: "#00C2B2",
              color: "#FFFFFF",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
