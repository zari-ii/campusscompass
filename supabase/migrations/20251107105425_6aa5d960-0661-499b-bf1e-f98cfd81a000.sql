-- Update handle_new_user function to save university_email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  random_username TEXT;
BEGIN
  -- Generate a random username as fallback
  random_username := 'user_' || substring(gen_random_uuid()::text, 1, 8);
  
  INSERT INTO public.profiles (user_id, email, username, university_email)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', random_username),
    NEW.raw_user_meta_data->>'university_email'
  );
  RETURN NEW;
END;
$$;