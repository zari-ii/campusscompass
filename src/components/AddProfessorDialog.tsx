import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddProfessorDialogProps {
  category?: "professor" | "psychologist" | "tutor" | "course";
  onSuccess?: () => void;
}

export const AddProfessorDialog = ({ category = "professor", onSuccess }: AddProfessorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("ADA University");
  const [department, setDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const departments = [
    "SPIA",
    "BBA", 
    "SITE",
    "Education",
    "LLB",
    "SAFS",
    "SDA",
    "Other"
  ];

  const moderateContent = async (content: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { content }
      });

      if (error) {
        console.error('Moderation error:', error);
        return true;
      }

      if (data?.blocked) {
        setModerationError(data.message || t.profanityError);
        return false;
      }

      return data?.isClean ?? true;
    } catch (error) {
      console.error('Error calling moderation:', error);
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModerationError(null);

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add a professor",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!name.trim() || !university.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and university are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check content moderation for name
      const isNameClean = await moderateContent(name);
      if (!isNameClean) {
        setIsSubmitting(false);
        toast({
          title: t.submissionBlocked,
          description: t.profanityError,
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from("professionals")
        .insert({
          name: name.trim(),
          university: university.trim(),
          department: department.trim() || null,
          category,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Submission received",
        description: `${name} has been submitted for review. An admin will approve it shortly.`
      });

      // Reset form
      setName("");
      setDepartment("");
      setModerationError(null);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding professor:", error);
      toast({
        title: "Error",
        description: "Failed to add professor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (category) {
      case "psychologist": return "Add Mental Health Consultant";
      case "tutor": return "Add Tutor/Coach";
      case "course": return "Add Course";
      default: return t.addProfessor;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t.addProfessor}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter professor name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setModerationError(null);
              }}
              required
            />
          </div>

          {moderationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {moderationError}
                <p className="mt-2 text-sm">{t.reviseContent}</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="university">University *</Label>
            <Input
              id="university"
              placeholder="Enter university name"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">School/Department (Optional)</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Professor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
