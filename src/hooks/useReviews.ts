import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CourseGrade {
  course: string;
  grade: string;
}

interface ReviewWithProfile {
  id: string;
  user_id: string;
  professional_id: string;
  category: string;
  overall_rating: number;
  teaching_rating: number;
  feedback: string;
  tags: string[];
  courses: CourseGrade[];
  comfort_level: number | null;
  workplace_environment: string | null;
  recommend_to_friend: boolean | null;
  created_at: string;
  profile: {
    username: string;
    university_email: string | null;
  } | null;
}

interface SubmitReviewData {
  professional_id: string;
  category: string;
  overall_rating: number;
  teaching_rating: number;
  feedback: string;
  tags: string[];
  courses: CourseGrade[];
  comfort_level?: number;
  workplace_environment?: string;
  recommend_to_friend?: boolean;
}

export const useReviews = (professionalId: string) => {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("professional_id", professionalId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Fetch profiles for review authors
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username, university_email")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { username: p.username, university_email: p.university_email }]) || []
      );

      const reviewsWithProfiles: ReviewWithProfile[] = reviewsData.map(review => ({
        id: review.id,
        user_id: review.user_id,
        professional_id: review.professional_id,
        category: review.category,
        overall_rating: review.overall_rating,
        teaching_rating: review.teaching_rating,
        feedback: review.feedback,
        tags: review.tags || [],
        courses: (review.courses as unknown as CourseGrade[]) || [],
        comfort_level: review.comfort_level,
        workplace_environment: review.workplace_environment,
        recommend_to_friend: review.recommend_to_friend,
        created_at: review.created_at,
        profile: profilesMap.get(review.user_id) || null
      }));

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (reviewData: SubmitReviewData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a review",
        variant: "destructive"
      });
      return false;
    }

    try {
      const insertData = {
        user_id: user.id,
        professional_id: reviewData.professional_id,
        category: reviewData.category,
        overall_rating: reviewData.overall_rating,
        teaching_rating: reviewData.teaching_rating,
        feedback: reviewData.feedback,
        tags: reviewData.tags,
        courses: JSON.parse(JSON.stringify(reviewData.courses)),
        comfort_level: reviewData.comfort_level || null,
        workplace_environment: reviewData.workplace_environment || null,
        recommend_to_friend: reviewData.recommend_to_friend ?? null
      };

      const { error } = await supabase.from("reviews").insert(insertData);

      if (error) throw error;

      return true;
    } catch (error: unknown) {
      console.error("Error submitting review:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: "Error submitting review",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel(`reviews-${professionalId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `professional_id=eq.${professionalId}`
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId]);

  return {
    reviews,
    loading,
    submitReview,
    refetch: fetchReviews
  };
};
