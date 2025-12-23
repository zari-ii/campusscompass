-- Create OTP verification codes table with security features
CREATE TABLE public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_hash TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookup and cleanup
CREATE INDEX idx_otp_verifications_email_hash ON public.otp_verifications(email_hash);
CREATE INDEX idx_otp_verifications_expires_at ON public.otp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Only allow edge functions (service role) to access this table
-- No public access - this is security critical
CREATE POLICY "Service role only access"
ON public.otp_verifications
FOR ALL
USING (false)
WITH CHECK (false);