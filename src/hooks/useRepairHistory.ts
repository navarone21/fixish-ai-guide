import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RepairProject {
  id: string;
  title: string;
  description: string;
  status: "in_progress" | "completed" | "paused";
  confidence_score?: number;
  tools_used?: string[];
  images?: string[];
  notes?: string;
  created_at: Date;
  completed_at?: Date;
}

export const useRepairHistory = (userId: string) => {
  const [projects, setProjects] = useState<RepairProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Set user context for RLS
      await supabase.rpc('set_user_context', { p_user_id: userId });
      
      const { data, error } = await supabase
        .from('repair_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProjects(data?.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status as "in_progress" | "completed" | "paused",
        confidence_score: p.confidence_score || undefined,
        tools_used: p.tools_used || undefined,
        images: p.images || undefined,
        notes: p.notes || undefined,
        created_at: new Date(p.created_at),
        completed_at: p.completed_at ? new Date(p.completed_at) : undefined,
      })) || []);
    } catch (err) {
      console.error('Error loading repair history:', err);
      // Don't show error if table doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (project: Omit<RepairProject, 'id' | 'created_at'>) => {
    try {
      await supabase.rpc('set_user_context', { p_user_id: userId });
      
      const projectData = {
        ...project,
        user_id: userId,
        completed_at: project.completed_at ? project.completed_at.toISOString() : undefined,
      };
      
      const { data, error } = await supabase
        .from('repair_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Project saved",
        description: "Repair project has been saved to your history",
      });

      await loadProjects();
      return data;
    } catch (err) {
      console.error('Error saving project:', err);
      toast({
        title: "Save failed",
        description: "Could not save project to history",
        variant: "destructive",
      });
    }
  };

  const updateProject = async (id: string, updates: Partial<RepairProject>) => {
    try {
      await supabase.rpc('set_user_context', { p_user_id: userId });
      
      const updateData: any = { ...updates };
      if (updateData.completed_at && updateData.completed_at instanceof Date) {
        updateData.completed_at = updateData.completed_at.toISOString();
      }
      
      const { error } = await supabase
        .from('repair_projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await loadProjects();
      
      toast({
        title: "Project updated",
        description: "Changes have been saved",
      });
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await supabase.rpc('set_user_context', { p_user_id: userId });
      
      const { error } = await supabase
        .from('repair_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadProjects();
      
      toast({
        title: "Project deleted",
        description: "Repair project has been removed",
      });
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProjects();
    }
  }, [userId]);

  return {
    projects,
    loading,
    saveProject,
    updateProject,
    deleteProject,
    refreshProjects: loadProjects,
  };
};
