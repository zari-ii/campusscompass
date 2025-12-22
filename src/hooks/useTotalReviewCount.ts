import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTotalReviewCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count: totalCount, error } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("category", "professor");

        if (error) throw error;
        setCount(totalCount || 0);
      } catch (error) {
        console.error("Error fetching review count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("reviews-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews"
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, loading };
};
