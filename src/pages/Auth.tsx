import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // University email domains
  const universityDomains = ["@ada.edu.az", "@khazar.org", "@bsu.edu.az", "@atmu.edu.az"];

  const validateEmail = (email: string) => {
    const emailSchema = z.string().email();
    if (!emailSchema.safeParse(email).success) {
      return false;
    }
    return universityDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const validateUsername = (username: string) => {
    return username.trim().length >= 3 && username.trim().length <= 30;
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!validateEmail(email)) {
        toast({
          title: t.authError,
          description: t.universityEmailRequired,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!validatePassword(password)) {
        toast({
          title: t.authError,
          description: t.passwordRequired,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        if (!validateUsername(username)) {
          toast({
            title: t.authError,
            description: t.usernameRequired,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Sign up with username in metadata
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username.trim(),
              university_email: email.trim()
            }
          }
        });

        if (error) {
          let errorMessage = error.message;
          if (error.message.includes("already registered")) {
            errorMessage = t.userAlreadyExists || "This email is already registered. Please sign in instead.";
          }
          toast({
            title: t.authError,
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: t.signUpSuccess,
            description: t.signUpSuccessMessage || "Account created successfully!"
          });
          // Auto-login is handled by auth state change - redirect will happen automatically
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) {
          let errorMessage = t.invalidCredentials;
          if (error.message.includes("Invalid login credentials")) {
            errorMessage = t.invalidCredentials || "Invalid email or password. Please try again.";
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = t.emailNotConfirmed || "Please confirm your email before signing in.";
          }
          toast({
            title: t.authError,
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: t.signInSuccess
          });
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({
        title: t.authError,
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-center">
              {isSignUp ? t.signUp : t.signIn}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              {isSignUp ? t.createAccount || "Create your anonymous account" : t.welcomeBack || "Welcome back to Campus Compass"}
            </p>

            <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="anonymous_user"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.usernameHint || "Your username will be displayed on reviews (stays anonymous)"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t.universityEmail}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@ada.edu.az"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t.acceptedDomains || "Accepted"}: {universityDomains.join(", ")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (t.loading || "Loading...") : isSignUp ? t.signUp : t.signIn}
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