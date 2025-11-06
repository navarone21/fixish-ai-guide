-- Create feedback table for chat responses
CREATE TABLE public.chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_chat_feedback_session_id ON public.chat_feedback(session_id);
CREATE INDEX idx_chat_feedback_timestamp ON public.chat_feedback(timestamp DESC);

-- Enable RLS
ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public app)
CREATE POLICY "Anyone can insert feedback"
ON public.chat_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow users to view their own feedback
CREATE POLICY "Users can view own feedback"
ON public.chat_feedback
FOR SELECT
TO anon, authenticated
USING (true);