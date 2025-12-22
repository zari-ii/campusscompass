import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
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
    if (user && !showSurvey) {
      navigate("/");
    }
  }, [user, navigate, showSurvey]);

  const universityDomains = ["@ada.edu.az", "@khazar.org", "@bsu.edu.az", "@atmu.edu.az"];

  const validateEmail = (email: string) => {
    const emailSchema = z.string().email();
    if (!emailSchema.safeParse(email).success) return false;
    return universityDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const validateUsername = (username: string) => username.trim().length >= 3 && username.trim().length <= 30;
  const validatePassword = (password: string) => password.length >= 6;

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

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { username: username.trim(), university_email: email.trim() }
          }
        });

        if (error) {
          toast({ title: t.authError, description: error.message.includes("already registered") ? t.userAlreadyExists : error.message, variant: "destructive" });
        } else {
          toast({ title: t.signUpSuccess, description: t.signUpSuccessMessage });
          setShowSurvey(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          toast({ title: t.authError, description: t.invalidCredentials, variant: "destructive" });
        } else {
          toast({ title: t.signInSuccess });
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({ title: t.authError, description: error.message, variant: "destructive" });
    } finally {
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

  if (showSurvey && user) {
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
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t.universityEmail}</Label>
                <Input id="email" type="email" placeholder="student@ada.edu.az" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <p className="text-xs text-muted-foreground">{t.acceptedDomains}: {universityDomains.join(", ")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>{loading ? t.loading : isSignUp ? t.signUp : t.signIn}</Button>
            </form>

            <div className="mt-6 text-center">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setEmail(""); setPassword(""); setUsername(""); }} className="text-sm text-primary hover:underline">
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