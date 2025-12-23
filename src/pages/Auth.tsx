import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

type AuthStep = "credentials" | "otp" | "survey";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [surveyData, setSurveyData] = useState({
    previousPlatform: "",
    academicYear: "",
    howFoundUs: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (user && step !== "survey") {
      navigate("/");
    }
  }, [user, navigate, step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const universityDomains = ["@ada.edu.az", "@khazar.org", "@bsu.edu.az", "@atmu.edu.az"];

  const validateEmail = (email: string) => {
    const emailSchema = z.string().email();
    if (!emailSchema.safeParse(email).success) return false;
    return universityDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const validateUsername = (username: string) => username.trim().length >= 3 && username.trim().length <= 30;
  const validatePassword = (password: string) => password.length >= 6;

  const sendOTP = async (isResend = false) => {
    setOtpLoading(true);
    try {
      const response = await supabase.functions.invoke("send-otp", {
        body: { 
          email: email.trim().toLowerCase(), 
          action: isResend ? "resend" : "send" 
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to send verification code");
      }

      if (response.data?.error) {
        if (response.data.remainingSeconds) {
          setResendCooldown(response.data.remainingSeconds);
        }
        throw new Error(response.data.error);
      }

      setResendCooldown(60);
      toast({ 
        title: t.verificationCodeSent || "Verification code sent",
        description: t.checkYourEmail || "Please check your email inbox"
      });
      
      if (!isResend) {
        setStep("otp");
      }
    } catch (error: any) {
      toast({ 
        title: t.authError, 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({ 
        title: t.authError, 
        description: t.enterVerificationCode || "Please enter the 6-digit code", 
        variant: "destructive" 
      });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await supabase.functions.invoke("send-otp", {
        body: { 
          email: email.trim().toLowerCase(), 
          action: "verify",
          code: otpCode
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Verification failed");
      }

      if (response.data?.error) {
        const remainingAttempts = response.data.remainingAttempts;
        const message = remainingAttempts !== undefined 
          ? `${response.data.error}. ${remainingAttempts} attempts remaining.`
          : response.data.error;
        throw new Error(message);
      }

      if (response.data?.verified) {
        // OTP verified, proceed with signup
        await completeSignUp();
      }
    } catch (error: any) {
      toast({ 
        title: t.authError, 
        description: error.message, 
        variant: "destructive" 
      });
      setOtpCode("");
    } finally {
      setOtpLoading(false);
    }
  };

  const completeSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { username: username.trim(), university_email: email.trim() }
        }
      });

      if (error) {
        toast({ 
          title: t.authError, 
          description: error.message.includes("already registered") ? t.userAlreadyExists : error.message, 
          variant: "destructive" 
        });
      } else if (data.user) {
        toast({ title: t.signUpSuccess, description: t.signUpSuccessMessage });
        setStep("survey");
      }
    } catch (error: any) {
      toast({ title: t.authError, description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateEmail(email)) {
        toast({ title: t.authError, description: t.universityEmailRequired, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!validatePassword(password)) {
        toast({ title: t.authError, description: t.passwordRequired, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        if (!validateUsername(username)) {
          toast({ title: t.authError, description: t.usernameRequired, variant: "destructive" });
          setLoading(false);
          return;
        }

        // For signup, send OTP first
        setLoading(false);
        await sendOTP();
      } else {
        // For signin, proceed directly
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          toast({ title: t.authError, description: t.invalidCredentials, variant: "destructive" });
        } else {
          toast({ title: t.signInSuccess });
          navigate("/");
        }
        setLoading(false);
      }
    } catch (error: any) {
      toast({ title: t.authError, description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleSurveySubmit = async () => {
    if (!user) return;
    
    try {
      await supabase.from("user_surveys").insert({
        user_id: user.id,
        previous_platform: surveyData.previousPlatform || null,
        academic_year: surveyData.academicYear || null,
        how_found_us: surveyData.howFoundUs || null,
      });
    } catch (error) {
      console.error("Error saving survey:", error);
    }
    navigate("/");
  };

  const goBack = () => {
    setStep("credentials");
    setOtpCode("");
  };

  // Survey step
  if (step === "survey" && user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8">
              <h1 className="text-2xl font-bold mb-2 text-center">{t.surveyTitle}</h1>
              <p className="text-muted-foreground text-center mb-6">{t.surveySubtitle}</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.previousPlatformQuestion}</Label>
                  <Select value={surveyData.previousPlatform} onValueChange={(v) => setSurveyData({...surveyData, previousPlatform: v})}>
                    <SelectTrigger><SelectValue placeholder={t.selectOption} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t.platformNone}</SelectItem>
                      <SelectItem value="ratemyprofessor">{t.platformRateMyProfessor}</SelectItem>
                      <SelectItem value="reddit">{t.platformReddit}</SelectItem>
                      <SelectItem value="wordofmouth">{t.platformWordOfMouth}</SelectItem>
                      <SelectItem value="other">{t.platformOther}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.academicYearQuestion}</Label>
                  <Select value={surveyData.academicYear} onValueChange={(v) => setSurveyData({...surveyData, academicYear: v})}>
                    <SelectTrigger><SelectValue placeholder={t.selectOption} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t.year1}</SelectItem>
                      <SelectItem value="2">{t.year2}</SelectItem>
                      <SelectItem value="3">{t.year3}</SelectItem>
                      <SelectItem value="4">{t.year4}</SelectItem>
                      <SelectItem value="grad">{t.yearGrad}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.howFoundUsQuestion}</Label>
                  <Select value={surveyData.howFoundUs} onValueChange={(v) => setSurveyData({...surveyData, howFoundUs: v})}>
                    <SelectTrigger><SelectValue placeholder={t.selectOption} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">{t.foundSocialMedia}</SelectItem>
                      <SelectItem value="friends">{t.foundFriends}</SelectItem>
                      <SelectItem value="search">{t.foundSearch}</SelectItem>
                      <SelectItem value="university">{t.foundUniversity}</SelectItem>
                      <SelectItem value="other">{t.foundOther}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>{t.skipSurvey}</Button>
                  <Button className="flex-1" onClick={handleSurveySubmit}>{t.continueSurvey}</Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // OTP verification step
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8">
              <button 
                onClick={goBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.back || "Back"}
              </button>

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2 text-center">{t.verifyYourEmail || "Verify Your Email"}</h1>
              <p className="text-muted-foreground text-center mb-2">
                {t.verificationCodeSentTo || "We sent a verification code to"}
              </p>
              <p className="text-sm font-medium text-center mb-8">{email}</p>

              <div className="flex justify-center mb-6">
                <InputOTP 
                  maxLength={6} 
                  value={otpCode} 
                  onChange={setOtpCode}
                  disabled={otpLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={verifyOTP} 
                className="w-full mb-4" 
                disabled={otpLoading || otpCode.length !== 6}
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.verifying || "Verifying..."}
                  </>
                ) : (
                  t.verifyCode || "Verify Code"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t.didntReceiveCode || "Didn't receive the code?"}
                </p>
                <Button 
                  variant="ghost" 
                  onClick={() => sendOTP(true)}
                  disabled={resendCooldown > 0 || otpLoading}
                  className="text-primary"
                >
                  {resendCooldown > 0 
                    ? `${t.resendIn || "Resend in"} ${resendCooldown}s`
                    : t.resendCode || "Resend Code"
                  }
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Main auth form
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-center">{isSignUp ? t.signUp : t.signIn}</h1>
            <p className="text-muted-foreground text-center mb-8">{isSignUp ? t.createAccount : t.welcomeBack}</p>

            <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input id="username" placeholder="anonymous_user" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  <p className="text-xs text-muted-foreground">{t.usernameHint}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t.usernameWarning}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t.universityEmail}</Label>
                <Input id="email" type="email" placeholder="student@ada.edu.az" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <p className="text-xs text-muted-foreground">{t.acceptedDomains}: {universityDomains.join(", ")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || otpLoading}>
                {(loading || otpLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  isSignUp ? t.signUp : t.signIn
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => { 
                  setIsSignUp(!isSignUp); 
                  setEmail(""); 
                  setPassword(""); 
                  setUsername(""); 
                  setStep("credentials");
                  setOtpCode("");
                }} 
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
