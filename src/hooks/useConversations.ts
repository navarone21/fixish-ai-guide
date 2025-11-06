import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Set the user_id for RLS
      await supabase.rpc('set_config', {
        setting: 'app.user_id',
        value: userId
      });

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title: string) => {
    try {
      await supabase.rpc('set_config', {
        setting: 'app.user_id',
        value: userId
      });

      const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: userId, title }])
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await supabase.rpc('set_config', {
        setting: 'app.user_id',
        value: userId
      });

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  };

  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      await supabase.rpc('set_config', {
        setting: 'app.user_id',
        value: userId
      });

      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, title } : c)
      );
    } catch (err) {
      console.error('Error updating conversation title:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    refreshConversations: loadConversations,
  };
};
