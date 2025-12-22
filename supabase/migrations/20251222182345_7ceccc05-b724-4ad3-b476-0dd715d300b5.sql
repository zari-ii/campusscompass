-- Fix user_badges public exposure - restrict SELECT to badge owner only
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;

-- Only badge owners can view their own badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);