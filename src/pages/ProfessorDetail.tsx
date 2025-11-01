import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface CourseGrade {
  course: string;
  grade: string;
}

const ProfessorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Detect category from ID prefix
  const category = id?.startsWith('d') ? 'doctor' : 
                   id?.startsWith('t') ? 'tutor' : 
                   id?.startsWith('c') ? 'course' : 'professor';
  
  const [overallRating, setOverallRating] = useState(0);
  const [teachingRating, setTeachingRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([{ course: "", grade: "" }]);

  // Mock professor data
  const professor = {
    id: id || "1",
    name: "Dr. Sarah Johnson",
    department: "Computer Science",
    university: "State University",
    rating: 8.5,
    teachingScore: 4.5,
    totalReviews: 47
  };

  const getTeachingLabel = () => {
    switch (category) {
      case "doctor": return t.methodsOfHealing;
      case "tutor": return t.teachingStyle;
      case "course": return t.teachingStyle;
      default: return t.teachingStyle;
    }
  };

  const getInstitutionLabel = () => {
    switch (category) {
      case "doctor": return t.hospital;
      case "tutor": return t.educationalCenter;
      case "course": return t.educationalCenter;
      default: return t.university;
    }
  };

  const getCoursesLabel = () => {
    switch (category) {
      case "doctor": return t.specialty;
      case "tutor": return t.subjects;
      case "course": return t.subjects;
      default: return t.coursesAndGradesLabel;
    }
  };

  const availableTags = [
    t.clearExplanations,
    t.fairGrading,
    t.helpful,
    t.toughGrader,
    t.extraCredit,
    t.engagingLectures,
    t.availableOutsideClass,
    t.greatFeedback,
    t.challengingExams,
    t.inspiring
  ];

  const grades = [
    { letter: "A", percentage: "94-100" },
    { letter: "A-", percentage: "90-93" },
    { letter: "B+", percentage: "87-89" },
    { letter: "B", percentage: "83-86" },
    { letter: "B-", percentage: "80-82" },
    { letter: "C+", percentage: "77-79" },
    { letter: "C", percentage: "73-76" },
    { letter: "C-", percentage: "70-72" },
    { letter: "D+", percentage: "67-69" },
    { letter: "D", percentage: "60-66" },
    { letter: "F", percentage: "00-59" },
    { letter: "FX", percentage: "00" },
    { letter: "N", percentage: "-" },
    { letter: "Pass", percentage: "-" },
    { letter: "Fail", percentage: "-" },
    { letter: "Audit", percentage: "-" }
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCourseGrade = () => {
    setCourseGrades([...courseGrades, { course: "", grade: "" }]);
  };

  const removeCourseGrade = (index: number) => {
    setCourseGrades(courseGrades.filter((_, i) => i !== index));
  };

  const updateCourseGrade = (index: number, field: keyof CourseGrade, value: string) => {
    const updated = [...courseGrades];
    updated[index][field] = value;
    setCourseGrades(updated);
  };

  const handleSubmit = () => {
    if (overallRating === 0 || teachingRating === 0) {
      toast({
        title: t.missingRatings,
        description: t.provideRatings,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t.reviewSubmitted,
      description: t.thankYouFeedback
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Button>
          
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{professor.name}</h1>
                <p className="text-lg text-muted-foreground">{professor.department}</p>
                <p className="text-sm text-muted-foreground">{professor.university}</p>
              </div>

              <div className="flex gap-8 flex-wrap">
                <div className="text-center">
                  <div className={cn(
                    "text-5xl font-bold mb-1",
                    professor.rating >= 8 ? "text-success" : 
                    professor.rating >= 5 ? "text-warning" : "text-destructive"
                  )}>
                    {professor.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.overallRating}</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <StarRating rating={Math.round(professor.teachingScore)} readonly size="lg" />
                  </div>
                  <div className="text-sm text-muted-foreground">{getTeachingLabel()}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{professor.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">{t.reviews}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">{t.submitReview}</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t.overallRatingLabel}</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={overallRating || ""}
                      onChange={(e) => setOverallRating(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">{t.outOf10}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{getTeachingLabel()}</Label>
                  <StarRating rating={teachingRating} onRatingChange={setTeachingRating} size="lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{getCoursesLabel()}</Label>
                <div className="space-y-3">
                  {courseGrades.map((cg, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder={t.coursePlaceholder}
                        value={cg.course}
                        onChange={(e) => updateCourseGrade(index, "course", e.target.value)}
                        className="flex-1"
                      />
                      <Select value={cg.grade} onValueChange={(value) => updateCourseGrade(index, "grade", value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder={t.grade} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {grades.map((grade) => (
                            <SelectItem key={grade.letter} value={grade.letter}>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold min-w-[2rem]">{grade.letter}</span>
                                <span className="text-xs text-muted-foreground">({grade.percentage}%)</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {courseGrades.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeCourseGrade(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCourseGrade} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t.addAnotherCourse}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.yourFeedback}</Label>
                <Textarea
                  placeholder={t.feedbackPlaceholder}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.tags}</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} size="lg" className="w-full">
                {t.submitReviewButton}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfessorDetail;
