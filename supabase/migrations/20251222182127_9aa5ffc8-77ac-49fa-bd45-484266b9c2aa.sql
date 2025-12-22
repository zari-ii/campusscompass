-- Fix foreign key constraint to allow user deletion
-- Drop existing constraint and recreate with ON DELETE SET NULL
ALTER TABLE public.professionals 
DROP CONSTRAINT IF EXISTS professionals_created_by_fkey;

ALTER TABLE public.professionals 
ADD CONSTRAINT professionals_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;