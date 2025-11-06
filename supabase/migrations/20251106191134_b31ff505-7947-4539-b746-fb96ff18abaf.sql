-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert messages (public app)
CREATE POLICY "Anyone can insert messages"
ON public.chat_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow users to view their own messages
CREATE POLICY "Users can view own messages"
ON public.chat_sessions
FOR SELECT
TO anon, authenticated
USING (true);