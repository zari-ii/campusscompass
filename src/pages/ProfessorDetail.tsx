import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CourseGrade {
  course: string;
  grade: string;
}

const ProfessorDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
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

  const availableTags = [
    "Clear explanations",
    "Fair grading",
    "Helpful",
    "Tough grader",
    "Extra credit",
    "Engaging lectures",
    "Available outside class",
    "Great feedback",
    "Challenging exams",
    "Inspiring"
  ];

  const grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "Pass", "Fail", "Audit"];

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
        title: "Missing ratings",
        description: "Please provide both overall and teaching ratings",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Review submitted!",
      description: "Thank you for your feedback"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
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
                  <div className="text-sm text-muted-foreground">Overall Rating</div>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <StarRating rating={Math.round(professor.teachingScore)} readonly size="lg" />
                  </div>
                  <div className="text-sm text-muted-foreground">Teaching Style</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{professor.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Submit Your Review</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Overall Rating (1-10)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={overallRating || ""}
                      onChange={(e) => setOverallRating(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">out of 10</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Teaching Style</Label>
                  <StarRating rating={teachingRating} onRatingChange={setTeachingRating} size="lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Courses & Grades</Label>
                <div className="space-y-3">
                  {courseGrades.map((cg, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder="Course code (e.g., CS101)"
                        value={cg.course}
                        onChange={(e) => updateCourseGrade(index, "course", e.target.value)}
                        className="flex-1"
                      />
                      <Select value={cg.grade} onValueChange={(value) => updateCourseGrade(index, "grade", value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
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
                    Add Another Course
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Feedback</Label>
                <Textarea
                  placeholder="Share your experience with this professor..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
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
                Submit Review
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfessorDetail;
