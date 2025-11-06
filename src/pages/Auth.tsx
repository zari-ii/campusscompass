import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
          toast({
            title: t.authError,
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: t.signUpSuccess,
            description: "You can now sign in with your credentials."
          });
          setIsSignUp(false);
          setEmail("");
          setPassword("");
          setUsername("");
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) {
          toast({
            title: t.authError,
            description: t.invalidCredentials,
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
              {isSignUp ? "Create your anonymous account" : "Welcome back to Campus Compass"}
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
                    Your username will be displayed on reviews (stays anonymous)
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
                  Accepted: {universityDomains.join(", ")}
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
                {loading ? "Loading..." : isSignUp ? t.signUp : t.signIn}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
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