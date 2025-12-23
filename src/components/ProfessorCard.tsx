import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminView } from "@/contexts/AdminViewContext";
import { Trash2, Pencil, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfessorCardProps {
  id: string;
  name: string;
  department: string;
  university: string;
  rating: number;
  teachingScore: number;
  teachingStyleLabel?: string;
  courses: string[];
  tags: string[];
  category?: "professor" | "psychologist" | "tutor" | "course";
  reviewCount?: number;
  onDelete?: () => void;
}

export const ProfessorCard = ({ 
  id, 
  name, 
  department, 
  university, 
  rating, 
  teachingScore,
  teachingStyleLabel,
  courses,
  tags,
  category = "professor",
  reviewCount = 0,
  onDelete
}: ProfessorCardProps) => {
  const { isAdmin } = useAdmin();
  const { viewAsUser } = useAdminView();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const showAdminControls = isAdmin && !viewAsUser;
  const getUniversityLabel = () => {
    switch (category) {
      case "psychologist": return "Workplace";
      case "tutor": return "Educational Center";
      case "course": return "Provider";
      default: return "University";
    }
  };

  const getCoursesLabel = () => {
    switch (category) {
      case "psychologist": return "Specialties";
      case "tutor": return "Subjects";
      case "course": return "Modules";
      default: return "Courses";
    }
  };

  const getTeachingLabel = () => {
    switch (category) {
      case "psychologist": return "Approach";
      case "tutor": return "Teaching";
      case "course": return "Quality";
      default: return "Teaching Style";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return "text-rating-excellent";
    if (rating >= 8) return "text-rating-great";
    if (rating >= 7) return "text-rating-good";
    if (rating >= 6) return "text-rating-average";
    if (rating > 0) return "text-rating-poor";
    return "text-muted-foreground";
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Professor deleted",
        description: "The professor profile has been removed."
      });
      
      onDelete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete professor",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
      "bg-card relative"
    )}>
      {showAdminControls && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/admin/moderation`;
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                disabled={isDeleting}
                onClick={(e) => e.stopPropagation()}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Professor</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <Link to={`/professor/${id}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">{department}</p>
              <p className="text-xs text-muted-foreground">{university}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={cn("text-3xl font-bold", getRatingColor(rating))}>
                {rating > 0 ? rating.toFixed(1) : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                {reviewCount > 0 ? `${reviewCount} review${reviewCount !== 1 ? 's' : ''}` : "No reviews"}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-end text-sm">
              <div className="flex items-center gap-2">
                {teachingStyleLabel && teachingScore > 0 && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    teachingScore >= 4 ? "bg-rating-great/20 text-rating-great" :
                    teachingScore >= 3 ? "bg-rating-good/20 text-rating-good" :
                    teachingScore >= 2 ? "bg-rating-average/20 text-rating-average" :
                    "bg-rating-poor/20 text-rating-poor"
                  )}>
                    {teachingStyleLabel}
                  </span>
                )}
                <StarRating rating={Math.round(teachingScore)} readonly size="sm" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {courses.slice(0, 3).map((course, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {course}
              </Badge>
            ))}
            {courses.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{courses.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </Card>
  );
};
