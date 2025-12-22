import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, FileText, BarChart3, Cookie, TrendingUp, Calendar, Loader2 } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalReviews: number;
  totalSurveys: number;
  recentSignups: number;
  surveyBreakdown: {
    academicYear: Record<string, number>;
    howFoundUs: Record<string, number>;
    previousPlatform: Record<string, number>;
  };
  reviewStats: {
    averageRating: number;
    categoryBreakdown: Record<string, number>;
  };
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [cookieStats, setCookieStats] = useState({ accepted: 0, rejected: 0 });

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchAnalytics();
      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [user, authLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      // Fetch profiles count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch reviews with stats
      const { data: reviews, count: reviewsCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact" });

      // Fetch surveys
      const { data: surveys, count: surveysCount } = await supabase
        .from("user_surveys")
        .select("*");

      // Recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: recentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      // Process survey data
      const surveyBreakdown = {
        academicYear: {} as Record<string, number>,
        howFoundUs: {} as Record<string, number>,
        previousPlatform: {} as Record<string, number>,
      };

      surveys?.forEach((survey) => {
        if (survey.academic_year) {
          surveyBreakdown.academicYear[survey.academic_year] = 
            (surveyBreakdown.academicYear[survey.academic_year] || 0) + 1;
        }
        if (survey.how_found_us) {
          surveyBreakdown.howFoundUs[survey.how_found_us] = 
            (surveyBreakdown.howFoundUs[survey.how_found_us] || 0) + 1;
        }
        if (survey.previous_platform) {
          surveyBreakdown.previousPlatform[survey.previous_platform] = 
            (surveyBreakdown.previousPlatform[survey.previous_platform] || 0) + 1;
        }
      });

      // Process review data
      const categoryBreakdown: Record<string, number> = {};
      let totalRating = 0;
      reviews?.forEach((review) => {
        categoryBreakdown[review.category] = (categoryBreakdown[review.category] || 0) + 1;
        totalRating += review.overall_rating;
      });

      setAnalytics({
        totalUsers: usersCount || 0,
        totalReviews: reviewsCount || 0,
        totalSurveys: surveysCount || 0,
        recentSignups: recentCount || 0,
        surveyBreakdown,
        reviewStats: {
          averageRating: reviews?.length ? totalRating / reviews.length : 0,
          categoryBreakdown,
        },
      });

      // Note: Cookie consent is stored in localStorage client-side
      // For real tracking, you'd need to send this to the server
      // This is a placeholder showing how it would look
      setCookieStats({ accepted: 0, rejected: 0 });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">{t.adminDashboard || "Admin Dashboard"}</h1>
            <p className="text-muted-foreground mt-2">
              {t.adminDashboardDesc || "Overview of platform analytics and user data"}
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.totalUsers || "Total Users"}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics?.recentSignups || 0} {t.lastWeek || "last 7 days"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.totalReviews || "Total Reviews"}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalReviews || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.avgRating || "Avg rating"}: {analytics?.reviewStats.averageRating.toFixed(1) || "0"}/10
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.surveyResponses || "Survey Responses"}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalSurveys || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t.fromNewSignups || "From new signups"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.cookieConsent || "Cookie Consent"}
                </CardTitle>
                <Cookie className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{cookieStats.accepted}</div>
                <p className="text-xs text-muted-foreground">
                  {t.rejected || "Rejected"}: {cookieStats.rejected}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Survey Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t.academicYear || "Academic Year"}
                </CardTitle>
                <CardDescription>
                  {t.usersByYear || "Distribution by academic year"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.surveyBreakdown.academicYear && 
                    Object.entries(analytics.surveyBreakdown.academicYear).length > 0 ? (
                    Object.entries(analytics.surveyBreakdown.academicYear).map(([year, count]) => (
                      <div key={year} className="flex items-center justify-between">
                        <span className="text-sm">{year}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noData || "No data yet"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t.howFoundUs || "How Users Found Us"}
                </CardTitle>
                <CardDescription>
                  {t.acquisitionChannels || "User acquisition channels"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.surveyBreakdown.howFoundUs && 
                    Object.entries(analytics.surveyBreakdown.howFoundUs).length > 0 ? (
                    Object.entries(analytics.surveyBreakdown.howFoundUs).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm">{source}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noData || "No data yet"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t.previousPlatforms || "Previous Platforms"}
                </CardTitle>
                <CardDescription>
                  {t.competitorAnalysis || "Competitor analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.surveyBreakdown.previousPlatform && 
                    Object.entries(analytics.surveyBreakdown.previousPlatform).length > 0 ? (
                    Object.entries(analytics.surveyBreakdown.previousPlatform).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-sm">{platform}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noData || "No data yet"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Categories */}
          <Card>
            <CardHeader>
              <CardTitle>{t.reviewsByCategory || "Reviews by Category"}</CardTitle>
              <CardDescription>
                {t.reviewsDistribution || "Distribution of reviews across categories"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics?.reviewStats.categoryBreakdown && 
                  Object.entries(analytics.reviewStats.categoryBreakdown).length > 0 ? (
                  Object.entries(analytics.reviewStats.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{category}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-4">{t.noReviewsYet || "No reviews yet"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;