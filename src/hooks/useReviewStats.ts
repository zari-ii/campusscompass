import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  professional_id: string;
  reviewCount: number;
  avgRating: number;
  avgTeaching: number;
}

export const useReviewStats = (professionalIds: string[]) => {
  const [stats, setStats] = useState<Map<string, ReviewStats>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (professionalIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("professional_id, overall_rating, teaching_rating")
          .in("professional_id", professionalIds);

        if (error) throw error;

        const statsMap = new Map<string, ReviewStats>();

        // Initialize all IDs with zero stats
        professionalIds.forEach(id => {
          statsMap.set(id, {
            professional_id: id,
            reviewCount: 0,
            avgRating: 0,
            avgTeaching: 0
          });
        });

        // Group reviews by professional_id
        const grouped = new Map<string, { ratings: number[]; teachings: number[] }>();
        
        data?.forEach(review => {
          if (!grouped.has(review.professional_id)) {
            grouped.set(review.professional_id, { ratings: [], teachings: [] });
          }
          const group = grouped.get(review.professional_id)!;
          group.ratings.push(review.overall_rating);
          group.teachings.push(review.teaching_rating);
        });

        // Calculate averages
        grouped.forEach((group, id) => {
          const avgRating = group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length;
          const avgTeaching = group.teachings.reduce((a, b) => a + b, 0) / group.teachings.length;
          
          statsMap.set(id, {
            professional_id: id,
            reviewCount: group.ratings.length,
            avgRating: avgRating,
            avgTeaching: avgTeaching
          });
        });

        setStats(statsMap);
      } catch (error) {
        console.error("Error fetching review stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [professionalIds.join(",")]);

  return { stats, loading };
};
