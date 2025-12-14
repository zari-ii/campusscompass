import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { UserBadge } from "@/components/UserBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface CourseGrade {
  course: string;
  grade: string;
}

interface ReviewWithProfile {
  id: string;
  user_id: string;
  professional_id: string;
  category: string;
  overall_rating: number;
  teaching_rating: number;
  feedback: string;
  tags: string[];
  courses: CourseGrade[];
  comfort_level: number | null;
  workplace_environment: string | null;
  recommend_to_friend: boolean | null;
  created_at: string;
  profile: {
    username: string;
    university_email: string | null;
  } | null;
}

interface ReviewCardProps {
  review: ReviewWithProfile;
  category: string;
  onUpdate: (reviewId: string, data: { feedback: string; overall_rating: number; teaching_rating: number }) => Promise<boolean>;
  onDelete: (reviewId: string) => Promise<boolean>;
  getTeachingLabel: () => string;
  getCoursesLabel: () => string;
}

export const ReviewCard = ({ 
  review, 
  category, 
  onUpdate, 
  onDelete, 
  getTeachingLabel, 
  getCoursesLabel 
}: ReviewCardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editFeedback, setEditFeedback] = useState(review.feedback);
  const [editOverallRating, setEditOverallRating] = useState(review.overall_rating);
  const [editTeachingRating, setEditTeachingRating] = useState(review.teaching_rating);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === review.user_id;

  const handleSave = async () => {
    if (!editFeedback.trim()) return;
    
    setIsUpdating(true);
    const success = await onUpdate(review.id, {
      feedback: editFeedback.trim(),
      overall_rating: editOverallRating,
      teaching_rating: editTeachingRating
    });
    setIsUpdating(false);

    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditFeedback(review.feedback);
    setEditOverallRating(review.overall_rating);
    setEditTeachingRating(review.teaching_rating);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(review.id);
    setIsDeleting(false);
  };

  return (
    <div className="border-b border-border last:border-0 pb-6 last:pb-0">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold">{review.profile?.username || "Anonymous"}</p>
            {review.profile?.university_email && (
              <UserBadge type="verified_student" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isOwner && !isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
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
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.deleteReviewTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.deleteReviewDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t.delete}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8"
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8 text-success hover:text-success"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          <div className="text-center">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editOverallRating}
                  onChange={(e) => setEditOverallRating(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
                  className="w-16 h-8 text-center border rounded"
                />
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            ) : (
              <>
                <div className={cn(
                  "text-2xl font-bold",
                  review.overall_rating >= 8 ? "text-success" : 
                  review.overall_rating >= 5 ? "text-warning" : "text-destructive"
                )}>
                  {review.overall_rating}
                </div>
                <div className="text-xs text-muted-foreground">{t.overallRating}</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {isEditing ? (
            <StarRating rating={editTeachingRating} onRatingChange={setEditTeachingRating} size="sm" />
          ) : (
            <StarRating rating={review.teaching_rating} readonly size="sm" />
          )}
          <span className="text-sm text-muted-foreground">{getTeachingLabel()}</span>
        </div>
      </div>

      {review.courses && review.courses.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">{getCoursesLabel()}:</p>
          <div className="flex flex-wrap gap-2">
            {review.courses.map((cg, idx) => (
              <Badge key={idx} variant="secondary">
                {cg.course} - {cg.grade}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {isEditing ? (
        <Textarea
          value={editFeedback}
          onChange={(e) => setEditFeedback(e.target.value)}
          className="mb-3"
          rows={4}
        />
      ) : (
        <p className="text-foreground mb-3">{review.feedback}</p>
      )}

      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.tags.map((tag, idx) => (
            <Badge key={idx} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
