import { Header } from "@/components/Header";
import { CategoryCard } from "@/components/CategoryCard";
import { GraduationCap, Stethoscope, Users, BookText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  const categories = [
    {
      title: t.professors,
      description: t.professorsDesc,
      icon: GraduationCap,
      path: "/professors",
      count: 1247
    },
    {
      title: t.doctors,
      description: t.doctorsDesc,
      icon: Stethoscope,
      path: "/doctors",
      count: 892
    },
    {
      title: t.tutorsCoaches,
      description: t.tutorsCoachesDesc,
      icon: Users,
      path: "/tutors",
      count: 634
    },
    {
      title: t.courses,
      description: t.coursesDesc,
      icon: BookText,
      path: "/courses",
      count: 2156
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-block">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t.homeTitle}
              </h1>
              <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.homeSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.path} {...category} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
