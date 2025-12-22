-- Fix profiles table security - remove public access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a security definer function to get safe public profile data for reviews
-- This only returns non-sensitive fields and indicates verification status without exposing email
CREATE OR REPLACE FUNCTION public.get_public_profiles(user_ids uuid[])
RETURNS TABLE (
  user_id uuid,
  username text,
  is_anonymous boolean,
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.username,
    p.is_anonymous,
    (p.university_email IS NOT NULL AND p.university_email != '') as is_verified
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids);
$$;