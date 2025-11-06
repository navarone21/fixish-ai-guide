-- Create helper function to set user context for RLS
CREATE OR REPLACE FUNCTION public.set_user_context(p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.user_id', p_user_id, false);
END;
$$;