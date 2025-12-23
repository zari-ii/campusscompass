import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash function using Web Crypto API
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str + "campus_compass_otp_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface SendOTPRequest {
  email: string;
  action: "send" | "verify" | "resend";
  code?: string;
}

const MAX_ATTEMPTS = 5;
const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_MINUTES = 1;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, action, code }: SendOTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailHash = await hashString(email.toLowerCase().trim());

    if (action === "send" || action === "resend") {
      // Check rate limiting - prevent sending too many OTPs
      const { data: recentOTPs } = await supabase
        .from("otp_verifications")
        .select("created_at")
        .eq("email_hash", emailHash)
        .gte("created_at", new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentOTPs && recentOTPs.length > 0) {
        const timeSinceLastOTP = Date.now() - new Date(recentOTPs[0].created_at).getTime();
        const remainingSeconds = Math.ceil((RATE_LIMIT_MINUTES * 60 * 1000 - timeSinceLastOTP) / 1000);
        
        if (remainingSeconds > 0) {
          return new Response(
            JSON.stringify({ 
              error: "Please wait before requesting another code", 
              remainingSeconds 
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Clean up old OTPs for this email
      await supabase
        .from("otp_verifications")
        .delete()
        .eq("email_hash", emailHash);

      // Generate new OTP
      const otp = generateOTP();
      const codeHash = await hashString(otp);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in database
      const { error: insertError } = await supabase
        .from("otp_verifications")
        .insert({
          email_hash: emailHash,
          code_hash: codeHash,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error("Error storing OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to generate verification code" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send email with OTP using Resend API directly
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Campus Compass <onboarding@resend.dev>",
          to: [email],
          subject: "Your Verification Code - Campus Compass",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
              <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #18181b; font-size: 24px; margin: 0 0 8px 0;">Verify Your Email</h1>
                <p style="color: #71717a; font-size: 16px; margin: 0 0 32px 0;">Enter this code to complete your registration:</p>
                
                <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
                  <span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #18181b;">${otp}</span>
                </div>
                
                <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error("Error sending email:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to send verification email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`OTP sent successfully to ${email.substring(0, 3)}***`);

      return new Response(
        JSON.stringify({ success: true, message: "Verification code sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "verify") {
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Verification code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find the OTP record
      const { data: otpRecord, error: fetchError } = await supabase
        .from("otp_verifications")
        .select("*")
        .eq("email_hash", emailHash)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpRecord) {
        return new Response(
          JSON.stringify({ error: "No valid verification code found. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check attempts
      if (otpRecord.attempts >= MAX_ATTEMPTS) {
        // Delete the record to force new OTP request
        await supabase
          .from("otp_verifications")
          .delete()
          .eq("id", otpRecord.id);

        return new Response(
          JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the code
      const inputCodeHash = await hashString(code);
      
      if (inputCodeHash !== otpRecord.code_hash) {
        // Increment attempts
        await supabase
          .from("otp_verifications")
          .update({ attempts: otpRecord.attempts + 1 })
          .eq("id", otpRecord.id);

        const remainingAttempts = MAX_ATTEMPTS - otpRecord.attempts - 1;
        return new Response(
          JSON.stringify({ 
            error: "Invalid verification code", 
            remainingAttempts 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark as verified
      await supabase
        .from("otp_verifications")
        .update({ verified: true })
        .eq("id", otpRecord.id);

      console.log(`Email verified successfully: ${email.substring(0, 3)}***`);

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in send-otp function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
