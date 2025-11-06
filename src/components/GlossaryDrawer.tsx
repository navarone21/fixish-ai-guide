import { useState } from "react";
import { Search, Book, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useGlossary } from "@/hooks/useGlossary";

interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onTermSelect?: (term: string) => void;
}

export const GlossaryDrawer = ({ 
  isOpen, 
  onClose, 
  isDarkMode,
  onTermSelect 
}: GlossaryDrawerProps) => {
  const { terms, searchTerms } = useGlossary();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTerms = searchQuery ? searchTerms(searchQuery) : terms;

  const handleTermClick = (term: string) => {
    if (onTermSelect) {
      onTermSelect(`Tell me more about ${term}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50 shadow-2xl"
            style={{
              background: isDarkMode ? "#1A1C1E" : "#FFFFFF",
            }}
          >
            {/* Header */}
            <div 
              className="p-4 border-b"
              style={{
                borderColor: isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.3)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5" style={{ color: "#00C2B2" }} />
                  <h2 className="text-lg font-bold" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
                    Glossary
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-primary/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                  style={{ color: "#999999" }}
                />
                <Input
                  placeholder="Search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  style={{
                    background: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.8)",
                    borderColor: "rgba(0, 194, 178, 0.3)",
                  }}
                />
              </div>
            </div>

            {/* Terms List */}
            <ScrollArea className="h-[calc(100vh-130px)]">
              <div className="p-4 space-y-3">
                {filteredTerms.length === 0 ? (
                  <p className="text-center text-sm py-8" style={{ color: "#999999" }}>
                    No terms found
                  </p>
                ) : (
                  filteredTerms.map(term => (
                    <button
                      key={term.id}
                      onClick={() => handleTermClick(term.term)}
                      className="w-full text-left p-3 rounded-lg transition-all hover:shadow-md"
                      style={{
                        background: isDarkMode ? "rgba(35, 37, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                        border: `1px solid ${isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.15)"}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span 
                          className="font-semibold text-sm"
                          style={{ color: "#00C2B2" }}
                        >
                          {term.term}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {term.category}
                        </Badge>
                      </div>
                      <p 
                        className="text-xs line-clamp-2"
                        style={{ color: isDarkMode ? "#CCCCCC" : "#666666" }}
                      >
                        {term.definition}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
