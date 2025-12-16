import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  count: number;
  comingSoon?: boolean;
}

export const CategoryCard = ({ title, description, icon: Icon, path, count, comingSoon = false }: CategoryCardProps) => {
  const { t } = useLanguage();
  
  const cardContent = (
    <Card className={cn(
      "group relative overflow-hidden p-6 transition-all duration-300",
      "bg-card",
      comingSoon 
        ? "cursor-not-allowed" 
        : "hover:shadow-lg hover:scale-105 hover:border-primary/50"
    )}>
      {comingSoon && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <span className="text-lg font-semibold text-primary px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            {t.comingSoon}
          </span>
        </div>
      )}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity",
        !comingSoon && "group-hover:opacity-100"
      )} />
      <div className={cn("relative space-y-4", comingSoon && "opacity-50")}>
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-3 transition-all group-hover:scale-110">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{count} {t.reviews}</span>
        </div>
        <div>
          <h3 className={cn("text-xl font-semibold mb-2 transition-colors", !comingSoon && "group-hover:text-primary")}>{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );

  if (comingSoon) {
    return cardContent;
  }
  
  return <Link to={path}>{cardContent}</Link>;
};
