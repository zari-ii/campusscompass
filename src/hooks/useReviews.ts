import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
    is_verified: boolean;
    is_anonymous: boolean;
  } | null;
}

interface SubmitReviewData {
  professional_id: string;
  category: string;
  overall_rating: number;
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
  const { t } = useLanguage();

  const moderateContent = async (content: string): Promise<{ isClean: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { content }
      });

      if (error) {
        console.error('Moderation error:', error);
        return { isClean: true }; // Allow submission if moderation fails
      }

      return {
        isClean: data?.isClean ?? true,
        message: data?.message
      };
    } catch (error) {
      console.error('Error calling moderation:', error);
      return { isClean: true }; // Allow submission if moderation fails
    }
  };

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

      // Fetch profiles for review authors using secure function
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .rpc("get_public_profiles", { user_ids: userIds });

      const profilesMap = new Map(
        profilesData?.map((p: { user_id: string; username: string; is_anonymous: boolean; is_verified: boolean }) => [
          p.user_id, 
          { username: p.username, is_anonymous: p.is_anonymous, is_verified: p.is_verified }
        ]) || []
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
      // Check content moderation before submitting
      const moderationResult = await moderateContent(reviewData.feedback);
      
      if (!moderationResult.isClean) {
        toast({
          title: t.submissionBlocked,
          description: moderationResult.message || t.profanityError,
          variant: "destructive"
        });
        return false;
      }

      const insertData = {
        user_id: user.id,
        professional_id: reviewData.professional_id,
        category: reviewData.category,
        overall_rating: reviewData.overall_rating,
        feedback: reviewData.feedback,
        tags: reviewData.tags,
        courses: JSON.parse(JSON.stringify(reviewData.courses)),
        comfort_level: reviewData.comfort_level || null,
        workplace_environment: reviewData.workplace_environment || null,
        recommend_to_friend: reviewData.recommend_to_friend ?? null
      };

      const { error } = await supabase.from("reviews").insert(insertData);

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Your review has been submitted for approval. An admin will review it shortly."
      });

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

  const updateReview = async (reviewId: string, reviewData: Partial<SubmitReviewData>, isAdmin: boolean = false): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update a review",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Check content moderation if feedback is being updated
      if (reviewData.feedback) {
        const moderationResult = await moderateContent(reviewData.feedback);
        
        if (!moderationResult.isClean) {
          toast({
            title: t.submissionBlocked,
            description: moderationResult.message || t.profanityError,
            variant: "destructive"
          });
          return false;
        }
      }

      const updateData: Record<string, unknown> = {};
      if (reviewData.overall_rating !== undefined) updateData.overall_rating = reviewData.overall_rating;
      if (reviewData.feedback !== undefined) updateData.feedback = reviewData.feedback;
      if (reviewData.tags !== undefined) updateData.tags = reviewData.tags;
      if (reviewData.courses !== undefined) updateData.courses = JSON.parse(JSON.stringify(reviewData.courses));
      if (reviewData.comfort_level !== undefined) updateData.comfort_level = reviewData.comfort_level;
      if (reviewData.workplace_environment !== undefined) updateData.workplace_environment = reviewData.workplace_environment;
      if (reviewData.recommend_to_friend !== undefined) updateData.recommend_to_friend = reviewData.recommend_to_friend;

      // Admins can update any review, regular users can only update their own
      let query = supabase
        .from("reviews")
        .update(updateData)
        .eq("id", reviewId);
      
      // Only filter by user_id if not an admin
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { error } = await query;

      if (error) throw error;

      toast({
        title: t.reviewUpdated,
        description: t.reviewUpdatedMessage
      });

      return true;
    } catch (error: unknown) {
      console.error("Error updating review:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: t.errorUpdatingReview,
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteReview = async (reviewId: string, isAdmin: boolean = false): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete a review",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Admins can delete any review, regular users can only delete their own
      let query = supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      
      // Only filter by user_id if not an admin
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { error } = await query;

      if (error) throw error;

      toast({
        title: t.reviewDeleted,
        description: t.reviewDeletedMessage
      });

      return true;
    } catch (error: unknown) {
      console.error("Error deleting review:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: t.errorDeletingReview,
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
    updateReview,
    deleteReview,
    refetch: fetchReviews
  };
};
