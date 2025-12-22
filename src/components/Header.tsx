import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminView } from "@/contexts/AdminViewContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Shield, Eye, EyeOff, User } from "lucide-react";
import logo from "@/assets/campus-compass-logo.jpg";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const { t } = useLanguage();
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { viewAsUser, toggleViewAsUser } = useAdminView();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    const username = user?.user_metadata?.username;
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    const email = user?.email;
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-all hover:opacity-80">
          <img src={logo} alt="Campus Compass Logo" className="w-12 h-12 rounded-full" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t.appName}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <p className="text-sm font-medium">{user.user_metadata?.username || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t.myProfile}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin/moderation" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Moderation
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center justify-between"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center">
                          {viewAsUser ? (
                            <EyeOff className="mr-2 h-4 w-4" />
                          ) : (
                            <Eye className="mr-2 h-4 w-4" />
                          )}
                          <Label htmlFor="view-as-user" className="cursor-pointer">
                            View as User
                          </Label>
                        </div>
                        <Switch 
                          id="view-as-user"
                          checked={viewAsUser}
                          onCheckedChange={toggleViewAsUser}
                          className="ml-2"
                        />
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/auth">{t.signIn}</Link>
            </Button>
          )}
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};
