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
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewCard } from "@/components/ReviewCard";

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
  const category = id?.startsWith('p') ? 'psychologist' : 
                   id?.startsWith('t') ? 'tutor' : 
                   id?.startsWith('c') ? 'course' : 'professor';
  
  const [overallRating, setOverallRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([{ course: "", grade: "" }]);
  const [workplaceEnvironment, setWorkplaceEnvironment] = useState("");
  const [recommendToFriend, setRecommendToFriend] = useState<string>("");
  const [comfortLevel, setComfortLevel] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { reviews, loading: reviewsLoading, submitReview, updateReview, deleteReview } = useReviews(id || "");

  // Professor data by ID
  const professorData: Record<string, { name: string; department: string; university: string }> = {
    // SPIA
    "1": { name: "Orkhan Nadirov", department: "SPIA", university: "ADA University" },
    "2": { name: "Ferit Murat Ozkaleli", department: "SPIA", university: "ADA University" },
    "3": { name: "Kavus Abushov", department: "SPIA", university: "ADA University" },
    "4": { name: "Sarvar Gurbanov", department: "SPIA", university: "ADA University" },
    "5": { name: "Ali Saqer", department: "SPIA", university: "ADA University" },
    // BBA
    "6": { name: "Elkin Nurmammadov", department: "BBA", university: "ADA University" },
    "7": { name: "Azra Brankovic", department: "BBA", university: "ADA University" },
    "8": { name: "Hulisi Ogut", department: "BBA", university: "ADA University" },
    "9": { name: "Narmina Rustamova", department: "BBA", university: "ADA University" },
    "10": { name: "Farid Gadirli", department: "BBA", university: "ADA University" },
    // SITE
    "11": { name: "Samir Rustamov", department: "SITE", university: "ADA University" },
    "12": { name: "Araz Yusubov", department: "SITE", university: "ADA University" },
    "13": { name: "Fuad Hajiyev", department: "SITE", university: "ADA University" },
    "14": { name: "Burcu Ramazanli", department: "SITE", university: "ADA University" },
    "15": { name: "Azar Aliyev", department: "SITE", university: "ADA University" },
    // EDUCATION
    "16": { name: "Vafa Kazdal", department: "Education", university: "ADA University" },
    "17": { name: "Ulker Ibrahimova", department: "Education", university: "ADA University" },
    "18": { name: "Samira Hajiyeva", department: "Education", university: "ADA University" },
    // LLB
    "19": { name: "Azad Talibov", department: "LLB", university: "ADA University" },
    "20": { name: "Kamala Nazarova", department: "LLB", university: "ADA University" },
    "21": { name: "Emin Karimov", department: "LLB", university: "ADA University" },
    "22": { name: "Juan Rodrigo Labardini Flores", department: "LLB", university: "ADA University" },
    "23": { name: "Aynur Akhundli", department: "LLB", university: "ADA University" },
    // SAFS
    "24": { name: "Saida Aliyeva", department: "SAFS", university: "ADA University" },
    "25": { name: "Matilde Tura", department: "SAFS", university: "ADA University" },
    "26": { name: "Asaf Omarov", department: "SAFS", university: "ADA University" },
    "27": { name: "Giacomo Zanello", department: "SAFS", university: "ADA University" },
    "28": { name: "Marcello Russ", department: "SAFS", university: "ADA University" },
    // SDA
    "29": { name: "Marco Bovati", department: "SDA", university: "ADA University" },
    "30": { name: "Emir Huseynov", department: "SDA", university: "ADA University" },
    "31": { name: "Stefania Sini", department: "SDA", university: "ADA University" },
    "32": { name: "Deniz Ozge Aytac", department: "SDA", university: "ADA University" },
    "33": { name: "Carl Haddrell", department: "SDA", university: "ADA University" },
  };

  const currentProfessor = professorData[id || "1"] || { name: "Unknown", department: "Unknown", university: "ADA University" };

  // Calculate dynamic ratings from reviews
  const calculatedRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length 
    : 0;

  const professor = {
    id: id || "1",
    name: currentProfessor.name,
    department: currentProfessor.department,
    university: currentProfessor.university,
    rating: calculatedRating,
    totalReviews: reviews.length
  };

  const getTeachingLabel = () => {
    switch (category) {
      case "psychologist": return t.approachStyle;
      case "tutor": return t.teachingStyle;
      case "course": return t.teachingStyle;
      default: return t.teachingStyle;
    }
  };

  const getInstitutionLabel = () => {
    switch (category) {
      case "psychologist": return t.workplace;
      case "tutor": return t.educationalCenter;
      case "course": return t.educationalCenter;
      default: return t.university;
    }
  };

  const getCoursesLabel = () => {
    switch (category) {
      case "psychologist": return t.specialty;
      case "tutor": return t.subjects;
      case "course": return t.subjects;
      default: return t.coursesAndGradesLabel;
    }
  };

  const availableTags = category === 'psychologist' ? [
    t.activeListener,
    t.confidentialTrustworthy,
    t.stressAnxietySupport,
    t.friendlyEmpathetic,
    t.lgbtqInclusive,
    t.crisisSupport,
    t.culturallySensitive,
    t.evidenceBased,
    t.flexibleScheduling,
    t.affordableCare
  ] : [
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

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: t.authError || "Authentication required",
        description: "Please sign in to submit a review",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (category === 'psychologist') {
      if (overallRating === 0 || comfortLevel === 0) {
        toast({
          title: t.missingRatings,
          description: "Please provide all required ratings",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (overallRating === 0) {
        toast({
          title: t.missingRatings,
          description: t.provideRatings,
          variant: "destructive"
        });
        return;
      }
    }

    if (!feedback.trim()) {
      toast({
        title: "Missing feedback",
        description: "Please provide your feedback",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const success = await submitReview({
      professional_id: id || "",
      category,
      overall_rating: overallRating,
      teaching_rating: overallRating, // Use overall rating for both
      feedback: feedback.trim(),
      tags: selectedTags,
      courses: courseGrades.filter(cg => cg.course.trim()),
      comfort_level: category === 'psychologist' ? comfortLevel : undefined,
      workplace_environment: category === 'psychologist' ? workplaceEnvironment : undefined,
      recommend_to_friend: category === 'psychologist' ? recommendToFriend === 'yes' : undefined
    });

    setIsSubmitting(false);

    if (success) {
      toast({
        title: t.reviewSubmitted,
        description: t.thankYouFeedback
      });

      // Reset form
      setOverallRating(0);
      setFeedback("");
      setSelectedTags([]);
      setCourseGrades([{ course: "", grade: "" }]);
      setWorkplaceEnvironment("");
      setRecommendToFriend("");
      setComfortLevel(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="gap-2 -ml-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Button>
          
          <Card className={cn(
            "p-8",
            category === 'psychologist' && "border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-background dark:from-blue-950/10 dark:border-blue-800/30"
          )}>
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
                    professor.rating >= 9 ? "text-rating-excellent" : 
                    professor.rating >= 8 ? "text-rating-great" : 
                    professor.rating >= 7 ? "text-rating-good" : 
                    professor.rating >= 6 ? "text-rating-average" : 
                    professor.rating > 0 ? "text-rating-poor" : "text-muted-foreground"
                  )}>
                    {professor.rating > 0 ? professor.rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.overallRating}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{professor.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">{t.reviews}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className={cn(
            "p-8",
            category === 'psychologist' && "border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-background dark:from-blue-950/10 dark:border-blue-800/30"
          )}>
            <h2 className="text-2xl font-bold mb-6">{t.reviews} ({reviews.length})</h2>
            
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to share your experience!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    category={category}
                    onUpdate={updateReview}
                    onDelete={deleteReview}
                    getCoursesLabel={getCoursesLabel}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className={cn(
            "p-8",
            category === 'psychologist' && "border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-background dark:from-blue-950/10 dark:border-blue-800/30"
          )}>
            <h2 className="text-2xl font-bold mb-6">{t.submitReview}</h2>
            
            <div className="space-y-6">
              {category === 'psychologist' ? (
                <>
                  <div className="space-y-2">
                    <Label>{t.workplaceEnvironment}</Label>
                    <Input
                      placeholder={t.workplacePlaceholder}
                      value={workplaceEnvironment}
                      onChange={(e) => setWorkplaceEnvironment(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.likabilityRating}</Label>
                    <StarRating rating={overallRating} onRatingChange={setOverallRating} size="lg" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.comfortLevel}</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={comfortLevel || ""}
                        onChange={(e) => setComfortLevel(Math.min(5, Math.max(1, parseInt(e.target.value) || 0)))}
                        className="w-20"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{t.veryUncomfortable}</span>
                          <span>{t.veryComfortable}</span>
                        </div>
                        <StarRating rating={comfortLevel} onRatingChange={setComfortLevel} size="md" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.recommendToFriend}</Label>
                    <Select value={recommendToFriend} onValueChange={setRecommendToFriend}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">{t.yes}</SelectItem>
                        <SelectItem value="no">{t.no}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.approachStyleLabel}</Label>
                    <StarRating rating={overallRating} onRatingChange={setOverallRating} size="lg" />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}

              <div className="space-y-2">
                <Label>{t.yourFeedback}</Label>
                <Textarea
                  placeholder={t.feedbackPlaceholder}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-4">
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
                  {selectedTags.filter(tag => !availableTags.includes(tag)).map((customTag) => (
                    <Badge
                      key={customTag}
                      variant="default"
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => toggleTag(customTag)}
                    >
                      {customTag} ✕
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="custom-tag"
                    placeholder={t.addCustomTag || "Add custom tag..."}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const value = input.value.trim();
                        if (value && !selectedTags.includes(value)) {
                          setSelectedTags([...selectedTags, value]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('custom-tag') as HTMLInputElement;
                      const value = input?.value.trim();
                      if (value && !selectedTags.includes(value)) {
                        setSelectedTags([...selectedTags, value]);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleSubmit} size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  t.submitReviewButton
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfessorDetail;
