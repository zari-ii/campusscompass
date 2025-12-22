import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      setAvatarUrl(data?.avatar_url || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user!.id}/${Math.random()}.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user!.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({ title: t.profileUpdated, description: t.avatarUpdatedMessage });
    } catch (error: any) {
      toast({ title: t.error, description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    const username = user?.user_metadata?.username;
    if (username) return username.slice(0, 2).toUpperCase();
    const email = user?.email;
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">{t.myProfile}</h1>

            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadAvatar}
                  disabled={uploading}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{t.clickToChangeAvatar}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.username}</Label>
                <Input
                  value={user.user_metadata?.username || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">{t.usernameCannotBeChanged}</p>
              </div>

              <div className="space-y-2">
                <Label>{t.universityEmail}</Label>
                <Input value={user.email || ""} disabled className="bg-muted" />
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6" onClick={() => navigate("/")}>
              {t.back}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
