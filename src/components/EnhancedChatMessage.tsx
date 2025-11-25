import { motion } from "framer-motion";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EnhancedContentRenderer } from "@/components/EnhancedContentRenderer";

interface EnhancedChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function EnhancedChatMessage({ role, content, timestamp }: EnhancedChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isAssistant = role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group flex gap-4 mb-6 ${isAssistant ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAssistant 
          ? 'bg-gradient-to-br from-primary to-primary-glow' 
          : 'bg-gradient-to-br from-secondary to-secondary/50'
      }`}>
        {isAssistant ? (
          <Bot className="w-5 h-5 text-primary-foreground" />
        ) : (
          <User className="w-5 h-5 text-secondary-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] ${isAssistant ? '' : 'flex flex-col items-end'}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isAssistant 
            ? 'bg-card border border-border shadow-sm' 
            : 'bg-primary text-primary-foreground'
        } ${isAssistant ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
          <EnhancedContentRenderer content={content} isAssistant={isAssistant} />
        </div>

        {/* Timestamp and Actions */}
        <div className={`flex items-center gap-2 mt-1.5 px-2 ${isAssistant ? '' : 'flex-row-reverse'}`}>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          
          {isAssistant && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
