import { Header } from "@/components/Header";
import { CategoryCard } from "@/components/CategoryCard";
import { GraduationCap, Stethoscope, BookOpen, Users } from "lucide-react";

const Index = () => {
  const categories = [
    {
      title: "Professors",
      description: "Rate and review university professors and their teaching methods",
      icon: GraduationCap,
      path: "/professors",
      count: 1247
    },
    {
      title: "Doctors",
      description: "Share experiences with medical professionals and healthcare providers",
      icon: Stethoscope,
      path: "/doctors",
      count: 892
    },
    {
      title: "School Teachers",
      description: "Review K-12 educators and their teaching approaches",
      icon: BookOpen,
      path: "/teachers",
      count: 2156
    },
    {
      title: "Other Professionals",
      description: "Rate tutors, coaches, trainers, and other service professionals",
      icon: Users,
      path: "/professionals",
      count: 634
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
                Rate Your Experience
              </h1>
              <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help others make informed decisions by sharing honest reviews about professionals who shaped your learning journey
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
