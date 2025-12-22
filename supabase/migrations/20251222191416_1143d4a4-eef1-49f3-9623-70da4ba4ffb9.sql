-- Drop the existing check constraint on teaching_rating
ALTER TABLE public.reviews DROP CONSTRAINT reviews_teaching_rating_check;

-- Make teaching_rating nullable with a default value of 1 (since it's no longer used)
ALTER TABLE public.reviews ALTER COLUMN teaching_rating SET DEFAULT 1;
ALTER TABLE public.reviews ALTER COLUMN teaching_rating DROP NOT NULL;

-- Add a new check constraint that allows NULL or 1-5 range
ALTER TABLE public.reviews ADD CONSTRAINT reviews_teaching_rating_check 
CHECK (teaching_rating IS NULL OR (teaching_rating >= 1 AND teaching_rating <= 5));