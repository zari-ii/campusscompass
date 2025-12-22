import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

interface ProfessorCardProps {
  id: string;
  name: string;
  department: string;
  university: string;
  rating: number;
  teachingScore: number;
  courses: string[];
  tags: string[];
  category?: "professor" | "psychologist" | "tutor" | "course";
  reviewCount?: number;
}

export const ProfessorCard = ({ 
  id, 
  name, 
  department, 
  university, 
  rating, 
  teachingScore,
  courses,
  tags,
  category = "professor",
  reviewCount = 0
}: ProfessorCardProps) => {
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

  return (
    <Link to={`/professor/${id}`}>
      <Card className={cn(
        "p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
        "bg-card"
      )}>
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{getTeachingLabel()}</span>
              <StarRating rating={Math.round(teachingScore)} readonly size="sm" />
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
      </Card>
    </Link>
  );
};
