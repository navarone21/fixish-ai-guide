import { TechnicalTermTooltip } from "./TechnicalTermTooltip";
import { parseTextWithTerms } from "@/utils/technicalTerms";

interface ParsedMessageProps {
  content: string;
  isDarkMode: boolean;
  onTermClick: (term: string) => void;
}

export const ParsedMessage = ({ content, isDarkMode, onTermClick }: ParsedMessageProps) => {
  const parts = parseTextWithTerms(content);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.isTerm && part.termData) {
          return (
            <TechnicalTermTooltip
              key={`${part.text}-${index}`}
              term={part.text}
              definition={part.termData.definition}
              category={part.termData.category}
              onClick={() => onTermClick(part.text)}
              isDarkMode={isDarkMode}
            />
          );
        }
        return <span key={index}>{part.text}</span>;
      })}
    </span>
  );
};
