import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProfessorCard } from "@/components/ProfessorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Professors = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with real data later
  const professors = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      department: "Computer Science",
      university: "State University",
      rating: 8.5,
      teachingScore: 4.5,
      courses: ["CS101", "CS201", "CS301"],
      tags: ["Clear explanations", "Fair grading", "Helpful"]
    },
    {
      id: "2",
      name: "Prof. Michael Chen",
      department: "Mathematics",
      university: "Tech Institute",
      rating: 7.2,
      teachingScore: 3.5,
      courses: ["MATH150", "MATH250"],
      tags: ["Challenging", "Research-focused"]
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      department: "Biology",
      university: "State University",
      rating: 9.1,
      teachingScore: 5,
      courses: ["BIO101", "BIO201", "BIO301", "BIO401"],
      tags: ["Passionate", "Engaging lectures", "Extra help"]
    }
  ];

  const filteredProfessors = professors.filter(prof =>
    prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{t.professors}</h1>
              <p className="text-muted-foreground">{t.findAndRate}</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t.addProfessor}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessors.map((professor) => (
              <ProfessorCard key={professor.id} {...professor} />
            ))}
          </div>

          {filteredProfessors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t.noResults}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Professors;
