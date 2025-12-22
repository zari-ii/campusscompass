import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Professional {
  id: string;
  name: string;
  department: string | null;
  university: string;
  category: string;
  created_at: string;
}

export const useProfessionals = (category: string = "professor") => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfessionals = async () => {
    try {
      // Only fetch approved professionals for public display
      // RLS handles this, but we also filter explicitly for clarity
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("category", category)
        .eq("status", "approved")
        .order("name", { ascending: true });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`professionals-${category}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "professionals",
          filter: `category=eq.${category}`
        },
        () => {
          fetchProfessionals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return { professionals, loading, refetch: fetchProfessionals };
};
