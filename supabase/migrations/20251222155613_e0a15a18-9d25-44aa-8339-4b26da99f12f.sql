INSERT INTO public.user_roles (user_id, role)
VALUES ('146a8178-0053-403e-b3c1-a8743578d5b2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;