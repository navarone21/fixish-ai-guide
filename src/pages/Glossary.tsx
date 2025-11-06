import { useState } from "react";
import { Search, Book, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlossary } from "@/hooks/useGlossary";
import { useChatTheme } from "@/contexts/ChatThemeContext";

export default function Glossary() {
  const navigate = useNavigate();
  const { theme } = useChatTheme();
  const isDarkMode = theme === "dark";
  const { terms, loading, searchTerms, getCategories } = useGlossary();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = getCategories();
  const filteredTerms = searchQuery
    ? searchTerms(searchQuery)
    : selectedCategory
    ? terms.filter(t => t.category === selectedCategory)
    : terms;

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: isDarkMode ? "#1A1C1E" : "#FFFFFF",
        color: isDarkMode ? "#EAEAEA" : "#1A1C1E"
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          background: isDarkMode ? "rgba(35, 37, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderColor: isDarkMode ? "rgba(0, 194, 178, 0.2)" : "rgba(0, 194, 178, 0.3)",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/chat")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#00C2B2" }} />
            </Button>
            
            <div className="flex items-center gap-3">
              <Book className="w-6 h-6" style={{ color: "#00C2B2" }} />
              <div>
                <h1 className="text-2xl font-bold">Technical Glossary</h1>
                <p className="text-sm" style={{ color: "#999999" }}>
                  {terms.length} repair & technical terms
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: "#999999" }}
            />
            <Input
              placeholder="Search terms, definitions, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{
                background: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.8)",
                borderColor: "rgba(0, 194, 178, 0.3)",
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-2">
            <TabsTrigger 
              value="all"
              onClick={() => setSelectedCategory(null)}
            >
              All Terms
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger 
                key={category}
                value={category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <TermsList terms={filteredTerms} loading={loading} isDarkMode={isDarkMode} />
          </TabsContent>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <TermsList terms={filteredTerms} loading={loading} isDarkMode={isDarkMode} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function TermsList({ terms, loading, isDarkMode }: { 
  terms: any[]; 
  loading: boolean;
  isDarkMode: boolean;
}) {
  if (loading) {
    return <div className="text-center py-12">Loading glossary...</div>;
  }

  if (terms.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: "#999999" }}>
        No terms found. Try a different search.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {terms.map((term, index) => (
        <motion.div
          key={term.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            className="p-5 hover:shadow-lg transition-all"
            style={{
              background: isDarkMode ? "rgba(35, 37, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
              borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold" style={{ color: "#00C2B2" }}>
                {term.term}
              </h3>
              <Badge variant="secondary">{term.category}</Badge>
            </div>
            
            <p className="text-sm mb-3" style={{ color: isDarkMode ? "#CCCCCC" : "#666666" }}>
              {term.definition}
            </p>

            {term.examples && term.examples.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium mb-1" style={{ color: "#999999" }}>
                  Examples:
                </p>
                <ul className="text-xs space-y-1" style={{ color: isDarkMode ? "#CCCCCC" : "#666666" }}>
                  {term.examples.slice(0, 2).map((example: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: "#00C2B2" }}>•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {term.related_terms && term.related_terms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {term.related_terms.slice(0, 3).map((related: string) => (
                  <Badge 
                    key={related}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: "rgba(0, 194, 178, 0.3)" }}
                  >
                    {related}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
