-- Create repair_projects table for tracking user repair history
CREATE TABLE public.repair_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'paused')),
  confidence_score DECIMAL(3,2),
  tools_used TEXT[],
  images TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.repair_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own repair projects"
ON public.repair_projects
FOR SELECT
USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can create their own repair projects"
ON public.repair_projects
FOR INSERT
WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own repair projects"
ON public.repair_projects
FOR UPDATE
USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own repair projects"
ON public.repair_projects
FOR DELETE
USING (user_id = current_setting('app.user_id', true));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_repair_projects_updated_at
BEFORE UPDATE ON public.repair_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_repair_projects_user_id ON public.repair_projects(user_id);
CREATE INDEX idx_repair_projects_status ON public.repair_projects(status);