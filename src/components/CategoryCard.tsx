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
}

export const CategoryCard = ({ title, description, icon: Icon, path, count }: CategoryCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Link to={path}>
      <Card className={cn(
        "group relative overflow-hidden p-6 transition-all duration-300",
        "hover:shadow-lg hover:scale-105 hover:border-primary/50",
        "bg-card"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-3 transition-all group-hover:scale-110">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{count} {t.reviews}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
