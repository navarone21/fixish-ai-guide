import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { TechnicalTerm } from "@/utils/technicalTerms";

interface TechnicalTermTooltipProps {
  term: string;
  definition: string;
  category: string;
  onClick: () => void;
  isDarkMode: boolean;
}

export const TechnicalTermTooltip = ({
  term,
  definition,
  category,
  onClick,
  isDarkMode,
}: TechnicalTermTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            className="inline-flex items-baseline gap-0.5 cursor-help transition-all duration-200 hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            style={{
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              textDecorationColor: isDarkMode ? "rgba(0, 194, 178, 0.5)" : "rgba(0, 194, 178, 0.6)",
              textUnderlineOffset: "3px",
              color: "inherit",
            }}
          >
            {term}
            <Info
              className="inline-block ml-0.5"
              style={{
                width: "12px",
                height: "12px",
                color: "#00C2B2",
                opacity: 0.7,
              }}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-3 shadow-xl"
          style={{
            background: isDarkMode ? "#232527" : "#FFFFFF",
            color: isDarkMode ? "#EAEAEA" : "#1A1C1E",
            border: `1px solid ${isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)"}`,
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm">{term}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(0, 194, 178, 0.1)",
                  color: "#00C2B2",
                }}
              >
                {category}
              </span>
            </div>
            <p className="text-xs leading-relaxed">{definition}</p>
            <p className="text-xs italic" style={{ color: "#999999" }}>
              Click to learn more
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
