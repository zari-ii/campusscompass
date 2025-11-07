import { Badge } from "@/components/ui/badge";
import { ShieldCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserBadgeProps {
  type: "verified_student" | "graduated_course";
  courseName?: string;
  grade?: string;
  className?: string;
}

export const UserBadge = ({ type, courseName, grade, className }: UserBadgeProps) => {
  if (type === "verified_student") {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
          className
        )}
      >
        <ShieldCheck className="w-3 h-3" />
        Verified Student
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary"
      className={cn(
        "gap-1 bg-success/10 text-success border-success/20 hover:bg-success/20",
        className
      )}
    >
      <GraduationCap className="w-3 h-3" />
      {courseName && grade ? `${courseName} (${grade})` : "Graduated"}
    </Badge>
  );
};
