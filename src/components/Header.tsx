import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export const Header = () => {
  const { t } = useLanguage();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-all hover:opacity-80">
          <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t.appName}
          </span>
        </Link>
        <LanguageSelector />
      </div>
    </header>
  );
};
