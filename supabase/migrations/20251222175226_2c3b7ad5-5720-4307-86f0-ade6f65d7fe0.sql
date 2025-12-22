-- Update reviews RLS policy: Only approved reviews visible to public, pending only to admins
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Approved reviews are viewable by everyone, pending only by admins"
ON public.reviews
FOR SELECT
USING (
  (status = 'approved') OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update professionals RLS policy: Only approved professionals visible to public, pending only to admins
DROP POLICY IF EXISTS "Approved professionals are viewable by everyone" ON public.professionals;

CREATE POLICY "Approved professionals are viewable by everyone, pending only by admins"
ON public.professionals
FOR SELECT
USING (
  (status = 'approved') OR has_role(auth.uid(), 'admin'::app_role)
);