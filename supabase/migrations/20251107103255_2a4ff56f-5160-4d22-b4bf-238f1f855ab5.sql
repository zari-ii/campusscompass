-- Create badge types enum
CREATE TYPE public.badge_type AS ENUM ('verified_student', 'graduated_course');

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  course_name TEXT,
  grade TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type, course_name)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "User badges are viewable by everyone"
ON public.user_badges
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges"
ON public.user_badges
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own badges"
ON public.user_badges
FOR DELETE
USING (auth.uid() = user_id);

-- Function to automatically assign verified student badge
CREATE OR REPLACE FUNCTION public.assign_verified_student_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has university email
  IF NEW.university_email IS NOT NULL AND NEW.university_email != '' THEN
    -- Insert verified student badge if not already exists
    INSERT INTO public.user_badges (user_id, badge_type)
    VALUES (NEW.user_id, 'verified_student')
    ON CONFLICT (user_id, badge_type, course_name) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to assign verified student badge on profile creation/update
CREATE TRIGGER on_profile_verified_student
  AFTER INSERT OR UPDATE OF university_email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_verified_student_badge();