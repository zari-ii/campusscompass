-- Create a table for professors/professionals
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  university TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'professor',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Create policies - anyone can view professionals
CREATE POLICY "Professionals are viewable by everyone" 
ON public.professionals 
FOR SELECT 
USING (true);

-- Authenticated users can add professionals
CREATE POLICY "Authenticated users can add professionals" 
ON public.professionals 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update professionals they created
CREATE POLICY "Users can update their own professionals" 
ON public.professionals 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_professionals_updated_at
BEFORE UPDATE ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster category lookups
CREATE INDEX idx_professionals_category ON public.professionals(category);