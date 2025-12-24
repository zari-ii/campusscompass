import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProfessorCard } from "@/components/ProfessorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Filter, ArrowUpDown, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReviewStats } from "@/hooks/useReviewStats";
import { useProfessionals } from "@/hooks/useProfessionals";
import { AddProfessorDialog } from "@/components/AddProfessorDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type SortOption = "rating-desc" | "rating-asc" | "name-asc" | "name-desc" | "reviews-desc";

const Professors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");

  const category = location.pathname === "/psychologists" ? "psychologist" :
                   location.pathname === "/tutors" ? "tutor" :
                   location.pathname === "/courses" ? "course" : "professor";

  // Fetch professors from database
  const { professionals: dbProfessionals, refetch } = useProfessionals(category);

  const getSeedData = () => {
    switch (location.pathname) {
      case "/psychologists":
        return [
          { id: "p1", name: "Dr. Sarah Martinez", department: "Clinical Psychology", university: "University Counseling Center", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "p2", name: "Dr. James Thompson", department: "Cognitive Behavioral Therapy", university: "Wellness Clinic", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "p3", name: "Dr. Aisha Patel", department: "Family Therapy", university: "Community Mental Health Center", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "p4", name: "Dr. Michael Chen", department: "Child & Adolescent Psychology", university: "University Counseling Center", rating: 0, teachingScore: 0, courses: [], tags: [] }
        ];
      case "/tutors":
        return [
          { id: "t1", name: "Aysel Məmmədova", department: "İngilis dili", university: "Baratson Academy", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "t2", name: "Kamran Əhmədov", department: "Riyaziyyat", university: "Hədəf Təhsil Mərkəzi", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "t3", name: "Səbinə Həsənova", department: "Azərbaycan dili", university: "Abituriyent Mərkəzi", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "t4", name: "Elvin Məmmədov", department: "Fizika", university: "İntelekt Mərkəzi", rating: 0, teachingScore: 0, courses: [], tags: [] }
        ];
      case "/courses":
        return [
          { id: "c1", name: "DİM Hazırlıq Kursu", department: "Ümumi Hazırlıq", university: "Baratson Academy", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "c2", name: "SAT Hazırlıq Proqramı", department: "Beynəlxalq İmtahan", university: "Hədəf Təhsil Mərkəzi", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "c3", name: "IELTS Hazırlıq Kursu", department: "İngilis dili", university: "Baratson Academy", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "c4", name: "Magistratura Hazırlığı", department: "Akademik", university: "İntelekt Mərkəzi", rating: 0, teachingScore: 0, courses: [], tags: [] }
        ];
      default: // professors
        return [
          // SPIA
          { id: "1", name: "Orkhan Nadirov", department: "SPIA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "2", name: "Ferit Murat Ozkaleli", department: "SPIA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "3", name: "Kavus Abushov", department: "SPIA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "4", name: "Sarvar Gurbanov", department: "SPIA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "5", name: "Ali Saqer", department: "SPIA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          // BBA
          { id: "6", name: "Elkin Nurmammadov", department: "BBA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "7", name: "Azra Brankovic", department: "BBA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "8", name: "Hulisi Ogut", department: "BBA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "9", name: "Narmina Rustamova", department: "BBA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "10", name: "Farid Gadirli", department: "BBA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          // SITE
          { id: "11", name: "Samir Rustamov", department: "SITE", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "12", name: "Araz Yusubov", department: "SITE", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "13", name: "Fuad Hajiyev", department: "SITE", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "14", name: "Burcu Ramazanli", department: "SITE", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "15", name: "Azar Aliyev", department: "SITE", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          // EDUCATION
          { id: "16", name: "Vafa Kazdal", department: "Education", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "17", name: "Ulker Ibrahimova", department: "Education", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "18", name: "Samira Hajiyeva", department: "Education", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          // LLB
          { id: "19", name: "Azad Talibov", department: "LLB", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "20", name: "Kamala Nazarova", department: "LLB", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "21", name: "Emin Karimov", department: "LLB", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "22", name: "Juan Rodrigo Labardini Flores", department: "LLB", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "23", name: "Aynur Akhundli", department: "LLB", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          // SAFS
          { id: "24", name: "Saida Aliyeva", department: "SAFS", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "25", name: "Matilde Tura", department: "SAFS", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "26", name: "Asaf Omarov", department: "SAFS", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "27", name: "Giacomo Zanello", department: "SAFS", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "28", name: "Marcello Russ", department: "SAFS", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          // SDA
          { id: "29", name: "Marco Bovati", department: "SDA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "30", name: "Emir Huseynov", department: "SDA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "31", name: "Stefania Sini", department: "SDA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "32", name: "Deniz Ozge Aytac", department: "SDA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
          { id: "33", name: "Carl Haddrell", department: "SDA", university: "ADA University", rating: 0, teachingScore: 0, courses: [], tags: [] },
        ];
    }
  };

  // Combine seed data with database professionals
  const allProfessors = useMemo(() => {
    const seedData = getSeedData();
    const dbData = dbProfessionals.map(p => ({
      id: p.id,
      name: p.name,
      department: p.department || "",
      university: p.university,
      rating: 0,
      teachingScore: 0,
      courses: [] as string[],
      tags: [] as string[]
    }));
    return [...seedData, ...dbData];
  }, [dbProfessionals, location.pathname]);

  // Extract unique universities and departments for filters
  const { universities, departments } = useMemo(() => {
    const univSet = new Set<string>();
    const deptSet = new Set<string>();
    allProfessors.forEach(p => {
      if (p.university) univSet.add(p.university);
      if (p.department) deptSet.add(p.department);
    });
    return {
      universities: Array.from(univSet).sort(),
      departments: Array.from(deptSet).sort()
    };
  }, [allProfessors]);
  
  // Get all professor IDs for fetching review stats
  const professorIds = useMemo(() => allProfessors.map(p => p.id), [allProfessors]);
  const { stats } = useReviewStats(professorIds);

  // Filter and sort professors
  const filteredAndSortedProfessors = useMemo(() => {
    // First filter by search query
    let result = allProfessors.filter(prof => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        prof.name.toLowerCase().includes(searchLower) ||
        prof.department.toLowerCase().includes(searchLower) ||
        prof.university.toLowerCase().includes(searchLower);
      
      const matchesUniversity = !selectedUniversity || prof.university === selectedUniversity;
      const matchesDepartment = !selectedDepartment || prof.department === selectedDepartment;
      
      return matchesSearch && matchesUniversity && matchesDepartment;
    });

    // Then sort based on selected option
    result.sort((a, b) => {
      const statsA = stats.get(a.id);
      const statsB = stats.get(b.id);
      const ratingA = statsA?.avgRating || 0;
      const ratingB = statsB?.avgRating || 0;
      const reviewsA = statsA?.reviewCount || 0;
      const reviewsB = statsB?.reviewCount || 0;

      switch (sortBy) {
        case "rating-desc":
          // Sort by rating descending, then by review count for ties
          if (ratingB !== ratingA) return ratingB - ratingA;
          return reviewsB - reviewsA;
        case "rating-asc":
          if (ratingA !== ratingB) return ratingA - ratingB;
          return reviewsA - reviewsB;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "reviews-desc":
          return reviewsB - reviewsA;
        default:
          return 0;
      }
    });

    return result;
  }, [allProfessors, searchQuery, selectedUniversity, selectedDepartment, sortBy, stats]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "rating-desc": return "Highest Rated";
      case "rating-asc": return "Lowest Rated";
      case "name-asc": return "Name (A-Z)";
      case "name-desc": return "Name (Z-A)";
      case "reviews-desc": return "Most Reviews";
    }
  };

  const clearFilters = () => {
    setSelectedUniversity(null);
    setSelectedDepartment(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedUniversity || selectedDepartment || searchQuery;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-12">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {location.pathname === "/psychologists" && t.psychologists}
                {location.pathname === "/tutors" && t.tutorsCoaches}
                {location.pathname === "/courses" && t.courses}
                {location.pathname === "/professors" && t.professors}
              </h1>
              <p className="text-muted-foreground">{t.findAndRate}</p>
            </div>
            <AddProfessorDialog category={category} onSuccess={refetch} />
          </div>

          {/* Search and Filter Controls */}
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter and Sort Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* University Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {selectedUniversity || t.university}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                  <DropdownMenuLabel>{t.university}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedUniversity(null)}>
                    All Universities
                  </DropdownMenuItem>
                  {universities.map(univ => (
                    <DropdownMenuItem 
                      key={univ} 
                      onClick={() => setSelectedUniversity(univ)}
                      className={selectedUniversity === univ ? "bg-accent" : ""}
                    >
                      {univ}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Department Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {selectedDepartment || t.department}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                  <DropdownMenuLabel>{t.department}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedDepartment(null)}>
                    All Departments
                  </DropdownMenuItem>
                  {departments.map(dept => (
                    <DropdownMenuItem 
                      key={dept} 
                      onClick={() => setSelectedDepartment(dept)}
                      className={selectedDepartment === dept ? "bg-accent" : ""}
                    >
                      {dept}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    {getSortLabel(sortBy)}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy("rating-desc")}>
                    Highest Rated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("rating-asc")}>
                    Lowest Rated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("reviews-desc")}>
                    Most Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                    Name (Z-A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {selectedUniversity && (
                  <Badge variant="secondary" className="gap-1">
                    {t.university}: {selectedUniversity}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSelectedUniversity(null)}
                    />
                  </Badge>
                )}
                {selectedDepartment && (
                  <Badge variant="secondary" className="gap-1">
                    {t.department}: {selectedDepartment}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSelectedDepartment(null)}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedProfessors.length} of {allProfessors.length} results
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProfessors.map((professor) => {
              const reviewStats = stats.get(professor.id);
              return (
                <ProfessorCard 
                  key={professor.id} 
                  {...professor}
                  rating={reviewStats?.avgRating || professor.rating}
                  teachingScore={reviewStats?.teachingStyleScore || professor.teachingScore}
                  teachingStyleLabel={reviewStats?.teachingStyleLabel || ""}
                  reviewCount={reviewStats?.reviewCount || 0}
                  category={category}
                  onDelete={refetch}
                />
              );
            })}
          </div>

          {filteredAndSortedProfessors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t.noResults}</p>
              {hasActiveFilters && (
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Professors;
