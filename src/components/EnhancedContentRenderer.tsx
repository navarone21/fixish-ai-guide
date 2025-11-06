import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Maximize2, Box } from "lucide-react";
import { ParsedMessage } from "./ParsedMessage";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface EnhancedContentRendererProps {
  content: string;
  isDarkMode: boolean;
  onTermClick: (term: string) => void;
}

interface ContentBlock {
  type: "text" | "image" | "video" | "code" | "steps" | "3d";
  content: string;
  language?: string;
  alt?: string;
  url?: string;
}

export const EnhancedContentRenderer = ({
  content,
  isDarkMode,
  onTermClick,
}: EnhancedContentRendererProps) => {
  const blocks = parseContent(content);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <ContentBlock
          key={index}
          block={block}
          isDarkMode={isDarkMode}
          onTermClick={onTermClick}
        />
      ))}
    </div>
  );
};

function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let currentPos = 0;

  // Regex patterns
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const videoRegex = /\[video\]\(([^)]+)\)/gi;
  const threeDRegex = /\[3d(?:[-_]?model)?\]\(([^)]+)\)/gi;
  const stepsRegex = /^(\d+)\.\s+(.+)$/gm;

  // Collect all matches with their positions
  const matches: Array<{ start: number; end: number; block: ContentBlock }> = [];

  // Find code blocks
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      block: {
        type: "code",
        content: match[2].trim(),
        language: match[1] || "text",
      },
    });
  }

  // Find images
  const imageMatches = [...content.matchAll(imageRegex)];
  imageMatches.forEach((match) => {
    matches.push({
      start: match.index!,
      end: match.index! + match[0].length,
      block: {
        type: "image",
        content: match[2],
        alt: match[1],
        url: match[2],
      },
    });
  });

  // Find videos
  const videoMatches = [...content.matchAll(videoRegex)];
  videoMatches.forEach((match) => {
    matches.push({
      start: match.index!,
      end: match.index! + match[0].length,
      block: {
        type: "video",
        content: match[1],
        url: match[1],
      },
    });
  });

  // Find 3D models
  const threeDMatches = [...content.matchAll(threeDRegex)];
  threeDMatches.forEach((match) => {
    matches.push({
      start: match.index!,
      end: match.index! + match[0].length,
      block: {
        type: "3d",
        content: match[1],
        url: match[1],
      },
    });
  });

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Check for step-by-step instructions (consecutive numbered lines)
  const lines = content.split("\n");
  let stepLines: string[] = [];
  let stepStartLine = -1;

  lines.forEach((line, lineIndex) => {
    const stepMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (stepMatch) {
      if (stepStartLine === -1) stepStartLine = lineIndex;
      stepLines.push(line);
    } else if (stepLines.length > 0) {
      // End of step sequence
      const stepContent = stepLines.join("\n");
      const stepStart = content.indexOf(stepContent);
      if (stepStart !== -1) {
        matches.push({
          start: stepStart,
          end: stepStart + stepContent.length,
          block: {
            type: "steps",
            content: stepContent,
          },
        });
      }
      stepLines = [];
      stepStartLine = -1;
    }
  });

  // Handle remaining steps at end
  if (stepLines.length > 0) {
    const stepContent = stepLines.join("\n");
    const stepStart = content.indexOf(stepContent);
    if (stepStart !== -1) {
      matches.push({
        start: stepStart,
        end: stepStart + stepContent.length,
        block: {
          type: "steps",
          content: stepContent,
        },
      });
    }
  }

  // Re-sort after adding steps
  matches.sort((a, b) => a.start - b.start);

  // Build blocks array with text in between
  matches.forEach((match) => {
    if (currentPos < match.start) {
      const textContent = content.slice(currentPos, match.start).trim();
      if (textContent) {
        blocks.push({ type: "text", content: textContent });
      }
    }
    blocks.push(match.block);
    currentPos = match.end;
  });

  // Add remaining text
  if (currentPos < content.length) {
    const textContent = content.slice(currentPos).trim();
    if (textContent) {
      blocks.push({ type: "text", content: textContent });
    }
  }

  return blocks.length > 0 ? blocks : [{ type: "text", content }];
}

function ContentBlock({
  block,
  isDarkMode,
  onTermClick,
}: {
  block: ContentBlock;
  isDarkMode: boolean;
  onTermClick: (term: string) => void;
}) {
  switch (block.type) {
    case "image":
      return <ImageBlock url={block.url!} alt={block.alt} isDarkMode={isDarkMode} />;
    case "video":
      return <VideoBlock url={block.url!} isDarkMode={isDarkMode} />;
    case "code":
      return <CodeBlock code={block.content} language={block.language} isDarkMode={isDarkMode} />;
    case "steps":
      return <StepsBlock content={block.content} isDarkMode={isDarkMode} />;
    case "3d":
      return <ThreeDBlock url={block.url!} isDarkMode={isDarkMode} />;
    case "text":
    default:
      return (
        <div className="whitespace-pre-wrap">
          <ParsedMessage content={block.content} isDarkMode={isDarkMode} onTermClick={onTermClick} />
        </div>
      );
  }
}

function ImageBlock({ url, alt, isDarkMode }: { url: string; alt?: string; isDarkMode: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group relative overflow-hidden rounded-lg border transition-all hover:shadow-lg"
             style={{ 
               borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
               maxWidth: "300px"
             }}>
          <img
            src={url}
            alt={alt || "Image"}
            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-8 h-8 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <img src={url} alt={alt || "Image"} className="w-full h-auto rounded-lg" />
      </DialogContent>
    </Dialog>
  );
}

function VideoBlock({ url, isDarkMode }: { url: string; isDarkMode: boolean }) {
  return (
    <div className="rounded-lg overflow-hidden border"
         style={{ 
           borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
           maxWidth: "600px"
         }}>
      <video
        src={url}
        controls
        className="w-full h-auto"
        style={{ background: isDarkMode ? "#1A1C1E" : "#F5F5F5" }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function CodeBlock({ code, language, isDarkMode }: { code: string; language?: string; isDarkMode: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg overflow-hidden border"
         style={{ 
           borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
           background: isDarkMode ? "#1A1C1E" : "#F5F5F5"
         }}>
      <div className="flex items-center justify-between px-4 py-2 border-b"
           style={{ 
             borderColor: isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.15)",
             background: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.5)"
           }}>
        <span className="text-xs font-medium" style={{ color: "#00C2B2" }}>
          {language || "code"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" style={{ color: "#00C2B2" }} />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function StepsBlock({ content, isDarkMode }: { content: string; isDarkMode: boolean }) {
  const steps = content.split("\n").map((line) => {
    const match = line.match(/^(\d+)\.\s+(.+)$/);
    return match ? { number: match[1], text: match[2] } : null;
  }).filter(Boolean);

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <StepCard key={index} step={step!} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
}

function StepCard({ step, isDarkMode }: { step: { number: string; text: string }; isDarkMode: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border overflow-hidden transition-all"
           style={{ 
             borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
             background: isDarkMode ? "rgba(35, 37, 39, 0.5)" : "rgba(255, 255, 255, 0.5)"
           }}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-opacity-80 transition-all">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                 style={{ 
                   background: "rgba(0, 194, 178, 0.2)",
                   color: "#00C2B2"
                 }}>
              {step.number}
            </div>
            <span className="flex-1 text-sm font-medium" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
              {step.text}
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "#00C2B2" }} />
            ) : (
              <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#999999" }} />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pl-16 text-sm" style={{ color: isDarkMode ? "#CCCCCC" : "#666666" }}>
            <p>Click to expand for more details about this step.</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function ThreeDBlock({ url, isDarkMode }: { url: string; isDarkMode: boolean }) {
  return (
    <div className="rounded-lg border p-6 text-center transition-all hover:shadow-lg cursor-pointer"
         style={{ 
           borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
           background: isDarkMode ? "rgba(35, 37, 39, 0.5)" : "rgba(255, 255, 255, 0.5)",
           maxWidth: "400px"
         }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
             style={{ background: "rgba(0, 194, 178, 0.2)" }}>
          <Box className="w-8 h-8" style={{ color: "#00C2B2" }} />
        </div>
        <div>
          <p className="font-medium mb-1" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
            View 3D Model
          </p>
          <p className="text-xs" style={{ color: "#999999" }}>
            {url.split("/").pop()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          style={{ borderColor: "#00C2B2", color: "#00C2B2" }}
        >
          <Box className="w-4 h-4" />
          Open 3D Viewer
        </Button>
      </div>
    </div>
  );
}
