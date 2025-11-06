import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  examples?: string[];
  related_terms?: string[];
}

export const useGlossary = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTerms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .order('term');

      if (error) throw error;
      setTerms(data || []);
    } catch (err) {
      console.error('Error loading glossary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load glossary');
    } finally {
      setLoading(false);
    }
  };

  const searchTerms = (query: string) => {
    if (!query.trim()) return terms;
    
    const lowerQuery = query.toLowerCase();
    return terms.filter(term =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.definition.toLowerCase().includes(lowerQuery) ||
      term.category.toLowerCase().includes(lowerQuery)
    );
  };

  const getTermsByCategory = (category: string) => {
    return terms.filter(term => term.category === category);
  };

  const getCategories = () => {
    return Array.from(new Set(terms.map(t => t.category))).sort();
  };

  useEffect(() => {
    loadTerms();
  }, []);

  return {
    terms,
    loading,
    error,
    searchTerms,
    getTermsByCategory,
    getCategories,
    refreshTerms: loadTerms,
  };
};
