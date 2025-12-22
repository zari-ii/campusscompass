-- Add status column to professionals table
ALTER TABLE public.professionals 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add status column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for faster filtering by status
CREATE INDEX idx_professionals_status ON public.professionals(status);
CREATE INDEX idx_reviews_status ON public.reviews(status);

-- Update RLS policy for professionals to only show approved to public
DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON public.professionals;

CREATE POLICY "Approved professionals are viewable by everyone" 
ON public.professionals 
FOR SELECT 
USING (status = 'approved' OR auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Update RLS policy for reviews to only show approved to public
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Approved reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (status = 'approved' OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Allow admins to update any professional (for moderation)
DROP POLICY IF EXISTS "Users can update their own professionals" ON public.professionals;

CREATE POLICY "Users can update their own professionals or admins can update any" 
ON public.professionals 
FOR UPDATE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Allow admins to delete professionals
CREATE POLICY "Admins can delete professionals" 
ON public.professionals 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update any review (for moderation)
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

CREATE POLICY "Users can update their own reviews or admins can update any" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Allow admins to delete any review
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Users can delete their own reviews or admins can delete any" 
ON public.reviews 
FOR DELETE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));