import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProfessorCard } from "@/components/ProfessorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Professors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const getMockData = () => {
    switch (location.pathname) {
      case "/doctors":
        return [
          {
            id: "d1",
            name: "Dr. Rəşad Məmmədov",
            department: "Kardioloq",
            university: "Mərkəzi Klinika Xəstəxanası",
            rating: 9.2,
            teachingScore: 4.8,
            courses: ["Ürək-damar xəstəlikləri", "Hipertenziya"],
            tags: ["Peşəkar", "Həssas", "Təcrübəli"]
          },
          {
            id: "d2",
            name: "Dr. Leyla Əliyeva",
            department: "Pediatr",
            university: "Respublika Uşaq Xəstəxanası",
            rating: 9.5,
            teachingScore: 5.0,
            courses: ["Uşaq sağlamlığı", "Vaksinasiya"],
            tags: ["Mehriban", "Diqqətli", "Əla mütəxəssis"]
          },
          {
            id: "d3",
            name: "Dr. Elçin Quliyev",
            department: "Nevroloq",
            university: "MediClub Xəstəxanası",
            rating: 8.8,
            teachingScore: 4.5,
            courses: ["Baş ağrıları", "Migren müalicəsi"],
            tags: ["Dəqiq diaqnoz", "Təcrübəli", "Səbirli"]
          },
          {
            id: "d4",
            name: "Dr. Aynur Həsənova",
            department: "Dermatoloq",
            university: "Təbabət Plaza Xəstəxanası",
            rating: 9.0,
            teachingScore: 4.7,
            courses: ["Dəri xəstəlikləri", "Kosmetologiya"],
            tags: ["Müasir yanaşma", "Effektiv müalicə", "Peşəkar"]
          }
        ];
      case "/tutors":
        return [
          {
            id: "t1",
            name: "Aysel Məmmədova",
            department: "İngilis dili",
            university: "Baratson Academy",
            rating: 9.3,
            teachingScore: 4.9,
            courses: ["IELTS", "TOEFL", "SAT"],
            tags: ["Interaktiv", "Nəticə yönümlü", "Səbirli"]
          },
          {
            id: "t2",
            name: "Kamran Əhmədov",
            department: "Riyaziyyat",
            university: "Hədəf Təhsil Mərkəzi",
            rating: 9.0,
            teachingScore: 4.7,
            courses: ["DİM hazırlığı", "Abituriyent", "SAT Math"],
            tags: ["Aydın izahat", "Çoxlu məşq", "Keyfiyyətli"]
          },
          {
            id: "t3",
            name: "Səbinə Həsənova",
            department: "Azərbaycan dili",
            university: "Abituriyent Mərkəzi",
            rating: 8.7,
            teachingScore: 4.4,
            courses: ["DİM", "Ədəbiyyat", "Qrammatika"],
            tags: ["Səbirli", "İlhamverici", "Dəstəkləyici"]
          },
          {
            id: "t4",
            name: "Elvin Məmmədov",
            department: "Fizika",
            university: "İntelekt Mərkəzi",
            rating: 9.1,
            teachingScore: 4.8,
            courses: ["DİM Fizika", "Abituriyent", "Olimpiada"],
            tags: ["Çətin tapşırıqlar", "Əla izahat", "Peşəkar"]
          }
        ];
      case "/courses":
        return [
          {
            id: "c1",
            name: "DİM Hazırlıq Kursu",
            department: "Ümumi Hazırlıq",
            university: "Baratson Academy",
            rating: 9.2,
            teachingScore: 4.9,
            courses: ["Riyaziyyat", "Azərbaycan dili", "İngilis dili"],
            tags: ["İntensiv", "Yüksək nəticə", "Təcrübəli müəllimlər"]
          },
          {
            id: "c2",
            name: "SAT Hazırlıq Proqramı",
            department: "Beynəlxalq İmtahan",
            university: "Hədəf Təhsil Mərkəzi",
            rating: 9.4,
            teachingScore: 5.0,
            courses: ["SAT Math", "SAT Reading", "SAT Writing"],
            tags: ["Yüksək ballar", "Peşəkar", "Dəstəkləyici"]
          },
          {
            id: "c3",
            name: "IELTS Hazırlıq Kursu",
            department: "İngilis dili",
            university: "Baratson Academy",
            rating: 9.0,
            teachingScore: 4.7,
            courses: ["Speaking", "Writing", "Reading", "Listening"],
            tags: ["Band 7+", "İnteraktiv", "Mock imtahanlar"]
          },
          {
            id: "c4",
            name: "Magistratura Hazırlığı",
            department: "Akademik",
            university: "İntelekt Mərkəzi",
            rating: 8.8,
            teachingScore: 4.5,
            courses: ["Xarici dil", "İxtisas fənni", "Test strategiyaları"],
            tags: ["Hərtərəfli", "Nəticə yönümlü", "Uğurlu keçid"]
          }
        ];
      default: // professors
        return [
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
    }
  };

  const professors = getMockData();

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
              <h1 className="text-4xl font-bold mb-2">
                {location.pathname === "/doctors" && t.doctors}
                {location.pathname === "/tutors" && t.tutorsCoaches}
                {location.pathname === "/courses" && t.courses}
                {location.pathname === "/professors" && t.professors}
              </h1>
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
              <ProfessorCard 
                key={professor.id} 
                {...professor}
                category={
                  location.pathname === "/doctors" ? "doctor" :
                  location.pathname === "/tutors" ? "tutor" :
                  location.pathname === "/courses" ? "course" :
                  "professor"
                }
              />
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
