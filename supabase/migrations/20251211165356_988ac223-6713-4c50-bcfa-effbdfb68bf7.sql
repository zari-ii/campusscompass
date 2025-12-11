-- Create reviews table for storing user reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  professional_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'professor',
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 10),
  teaching_rating INTEGER NOT NULL CHECK (teaching_rating >= 1 AND teaching_rating <= 5),
  feedback TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  courses JSONB DEFAULT '[]',
  comfort_level INTEGER CHECK (comfort_level IS NULL OR (comfort_level >= 1 AND comfort_level <= 5)),
  workplace_environment TEXT,
  recommend_to_friend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;