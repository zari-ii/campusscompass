-- Enable RLS on the profiles_public view
-- Note: For views, we use security_invoker to ensure RLS of underlying tables is respected
-- First, let's recreate the view with security_invoker = true

DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  username
FROM public.profiles;

-- Add a comment explaining the view's purpose
COMMENT ON VIEW public.profiles_public IS 'Public view of user profiles - only exposes non-sensitive data (user_id and username). Uses security_invoker to respect underlying table RLS policies.';