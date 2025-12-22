import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  X, 
  Edit, 
  Loader2, 
  Users, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  Trash2,
  Archive
} from "lucide-react";

interface Professional {
  id: string;
  name: string;
  university: string;
  department: string | null;
  category: string;
  status: string;
  created_at: string;
  created_by: string | null;
}

interface Review {
  id: string;
  professional_id: string;
  user_id: string;
  category: string;
  overall_rating: number;
  teaching_rating: number;
  feedback: string;
  status: string;
  created_at: string;
  professional_name?: string;
  tags?: string[];
  comfort_level?: number;
  recommend_to_friend?: boolean;
}

const AdminModeration = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Detail view state
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Edit dialog state
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({ name: "", university: "", department: "", feedback: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter by status
  const pendingProfessionals = professionals.filter(p => p.status === "pending");
  const approvedProfessionals = professionals.filter(p => p.status === "approved");
  const rejectedProfessionals = professionals.filter(p => p.status === "rejected");
  
  const pendingReviews = reviews.filter(r => r.status === "pending");
  const approvedReviews = reviews.filter(r => r.status === "approved");
  const rejectedReviews = reviews.filter(r => r.status === "rejected");

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (!isAdmin) {
        navigate("/");
        return;
      }
      fetchData();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all professionals
      const { data: professionalsData } = await supabase
        .from("professionals")
        .select("*")
        .order("created_at", { ascending: false });

      setProfessionals(professionalsData || []);

      // Fetch all reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      // Get professional names for reviews
      const professionalIds = [...new Set(reviewsData?.map(r => r.professional_id) || [])];
      const { data: profNames } = await supabase
        .from("professionals")
        .select("id, name")
        .in("id", professionalIds);

      const profNameMap = new Map(profNames?.map(p => [p.id, p.name]) || []);

      const reviewsWithNames = reviewsData?.map(r => ({
        ...r,
        professional_name: profNameMap.get(r.professional_id) || "Unknown"
      })) || [];

      setReviews(reviewsWithNames);
    } catch (error) {
      console.error("Error fetching moderation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProfessional = async (id: string) => {
    setIsSubmitting(true);
    try {
      const prof = professionals.find(p => p.id === id);
      const { error } = await supabase
        .from("professionals")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      // Send notification to the user who created it
      if (prof?.created_by) {
        await supabase.from("notifications").insert({
          user_id: prof.created_by,
          title: "Professor Approved",
          message: `The professor "${prof.name}" you added has been approved and is now visible.`,
          type: "success"
        });
      }

      toast({ title: "Professor approved", description: "Now visible on the public website." });
      setSelectedProfessional(null);
      fetchData();
    } catch (error) {
      console.error("Error approving:", error);
      toast({ title: "Error", description: "Failed to approve professor.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectProfessional = async (id: string) => {
    setIsSubmitting(true);
    try {
      const prof = professionals.find(p => p.id === id);
      const { error } = await supabase
        .from("professionals")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      // Send notification to the user who created it
      if (prof?.created_by) {
        await supabase.from("notifications").insert({
          user_id: prof.created_by,
          title: "Professor Rejected",
          message: `The professor "${prof.name}" you added has been rejected.`,
          type: "error"
        });
      }

      toast({ title: "Professor rejected", description: "Moved to rejected section." });
      setSelectedProfessional(null);
      fetchData();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({ title: "Error", description: "Failed to reject professor.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("professionals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Professor deleted", description: "Permanently removed." });
      setSelectedProfessional(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete professor.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveReview = async (id: string) => {
    setIsSubmitting(true);
    try {
      const review = reviews.find(r => r.id === id);
      const { error } = await supabase
        .from("reviews")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      // Send notification to the user who created the review
      if (review?.user_id) {
        await supabase.from("notifications").insert({
          user_id: review.user_id,
          title: "Review Approved",
          message: `Your review for "${review.professional_name}" has been approved and is now visible.`,
          type: "success"
        });
      }

      toast({ title: "Review approved", description: "Now visible on the public website." });
      setSelectedReview(null);
      fetchData();
    } catch (error) {
      console.error("Error approving:", error);
      toast({ title: "Error", description: "Failed to approve review.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectReview = async (id: string) => {
    setIsSubmitting(true);
    try {
      const review = reviews.find(r => r.id === id);
      const { error } = await supabase
        .from("reviews")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      // Send notification to the user who created the review
      if (review?.user_id) {
        await supabase.from("notifications").insert({
          user_id: review.user_id,
          title: "Review Rejected",
          message: `Your review for "${review.professional_name}" has been rejected.`,
          type: "error"
        });
      }

      toast({ title: "Review rejected", description: "Moved to rejected section." });
      setSelectedReview(null);
      fetchData();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({ title: "Error", description: "Failed to reject review.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Review deleted", description: "Permanently removed." });
      setSelectedReview(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditProfessional = (prof: Professional) => {
    setEditingProfessional(prof);
    setEditForm({
      name: prof.name,
      university: prof.university,
      department: prof.department || "",
      feedback: ""
    });
  };

  const openEditReview = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      name: "",
      university: "",
      department: "",
      feedback: review.feedback
    });
  };

  const handleSaveProfessional = async () => {
    if (!editingProfessional) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("professionals")
        .update({
          name: editForm.name,
          university: editForm.university,
          department: editForm.department || null
        })
        .eq("id", editingProfessional.id);

      if (error) throw error;

      toast({ title: "Professor updated", description: "Changes saved successfully." });
      setEditingProfessional(null);
      fetchData();
    } catch (error) {
      console.error("Error updating:", error);
      toast({ title: "Error", description: "Failed to update professor.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ feedback: editForm.feedback })
        .eq("id", editingReview.id);

      if (error) throw error;

      toast({ title: "Review updated", description: "Changes saved successfully." });
      setEditingReview(null);
      fetchData();
    } catch (error) {
      console.error("Error updating:", error);
      toast({ title: "Error", description: "Failed to update review.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading || authLoading || adminLoading) {
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
      
      <main className="container py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Content Moderation</h1>
                <p className="text-muted-foreground">
                  Review, approve, or reject submissions
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{pendingProfessionals.length + pendingReviews.length}</span>
                  <span className="text-xs text-muted-foreground">total</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Professors</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{pendingProfessionals.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Reviews</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{pendingReviews.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{approvedProfessionals.length + approvedReviews.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{rejectedProfessionals.length + rejectedReviews.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{professionals.length + reviews.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending
                {(pendingProfessionals.length + pendingReviews.length) > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {pendingProfessionals.length + pendingReviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>

            {/* Pending Tab */}
            <TabsContent value="pending" className="space-y-6">
              {/* Pending Professors */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Pending Professors
                      </CardTitle>
                      <CardDescription>New professor submissions awaiting review</CardDescription>
                    </div>
                    {pendingProfessionals.length > 0 && (
                      <Badge variant="outline">{pendingProfessionals.length} pending</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingProfessionals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pending professor submissions</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>University</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingProfessionals.map((prof) => (
                            <TableRow key={prof.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="font-medium">{prof.name}</TableCell>
                              <TableCell>{prof.university}</TableCell>
                              <TableCell>{prof.department || "-"}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {formatDate(prof.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedProfessional(prof)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApproveProfessional(prof.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRejectProfessional(prof.id)}
                                    disabled={isSubmitting}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Pending Reviews */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Pending Reviews
                      </CardTitle>
                      <CardDescription>New reviews awaiting moderation</CardDescription>
                    </div>
                    {pendingReviews.length > 0 && (
                      <Badge variant="outline">{pendingReviews.length} pending</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pending reviews</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Professor</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-[300px]">Preview</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingReviews.map((review) => (
                            <TableRow key={review.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                <Badge variant="secondary">{review.professional_name}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{review.overall_rating}/10</span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {truncateText(review.feedback, 80)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {formatDate(review.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedReview(review)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApproveReview(review.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRejectReview(review.id)}
                                    disabled={isSubmitting}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approved Tab */}
            <TabsContent value="approved" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Approved Professors ({approvedProfessionals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {approvedProfessionals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No approved professors yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>University</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedProfessionals.map((prof) => (
                            <TableRow key={prof.id}>
                              <TableCell className="font-medium">{prof.name}</TableCell>
                              <TableCell>{prof.university}</TableCell>
                              <TableCell>{prof.department || "-"}</TableCell>
                              <TableCell>{getStatusBadge(prof.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditProfessional(prof)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteProfessional(prof.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Approved Reviews ({approvedReviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {approvedReviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No approved reviews yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Professor</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-[300px]">Feedback</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedReviews.map((review) => (
                            <TableRow key={review.id}>
                              <TableCell>
                                <Badge variant="secondary">{review.professional_name}</Badge>
                              </TableCell>
                              <TableCell>{review.overall_rating}/10</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {truncateText(review.feedback, 60)}
                              </TableCell>
                              <TableCell>{getStatusBadge(review.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditReview(review)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteReview(review.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rejected Tab */}
            <TabsContent value="rejected" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Rejected Professors ({rejectedProfessionals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rejectedProfessionals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No rejected professors</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>University</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rejectedProfessionals.map((prof) => (
                            <TableRow key={prof.id}>
                              <TableCell className="font-medium">{prof.name}</TableCell>
                              <TableCell>{prof.university}</TableCell>
                              <TableCell>{getStatusBadge(prof.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApproveProfessional(prof.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteProfessional(prof.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Rejected Reviews ({rejectedReviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rejectedReviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No rejected reviews</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Professor</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-[300px]">Feedback</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rejectedReviews.map((review) => (
                            <TableRow key={review.id}>
                              <TableCell>
                                <Badge variant="secondary">{review.professional_name}</Badge>
                              </TableCell>
                              <TableCell>{review.overall_rating}/10</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {truncateText(review.feedback, 60)}
                              </TableCell>
                              <TableCell>{getStatusBadge(review.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApproveReview(review.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteReview(review.id)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Professor Detail Dialog */}
      <Dialog open={!!selectedProfessional} onOpenChange={() => setSelectedProfessional(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Professor Details</DialogTitle>
            <DialogDescription>Review the submission details before taking action</DialogDescription>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Name</Label>
                  <p className="font-medium">{selectedProfessional.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Category</Label>
                  <p className="capitalize">{selectedProfessional.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">University</Label>
                  <p>{selectedProfessional.university}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Department</Label>
                  <p>{selectedProfessional.department || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedProfessional.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Submitted</Label>
                  <p className="text-sm">{formatDate(selectedProfessional.created_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => openEditProfessional(selectedProfessional!)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectProfessional(selectedProfessional!.id)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleApproveProfessional(selectedProfessional!.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Full review content for moderation</DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Professor</Label>
                  <p className="font-medium">{selectedReview.professional_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Overall Rating</Label>
                  <p className="font-medium">{selectedReview.overall_rating}/10</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Teaching Rating</Label>
                  <p>{selectedReview.teaching_rating}/10</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Feedback</Label>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedReview.feedback}</p>
                </div>
              </div>
              {selectedReview.tags && selectedReview.tags.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedReview.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground text-xs">Comfort Level</Label>
                  <p>{selectedReview.comfort_level ? `${selectedReview.comfort_level}/10` : "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Recommend</Label>
                  <p>{selectedReview.recommend_to_friend ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Submitted</Label>
                  <p>{formatDate(selectedReview.created_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => openEditReview(selectedReview!)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectReview(selectedReview!.id)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleApproveReview(selectedReview!.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Professor Dialog */}
      <Dialog open={!!editingProfessional} onOpenChange={() => setEditingProfessional(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Professor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-university">University</Label>
              <Input
                id="edit-university"
                value={editForm.university}
                onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfessional(null)}>Cancel</Button>
            <Button onClick={handleSaveProfessional} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-feedback">Feedback</Label>
              <Textarea
                id="edit-feedback"
                value={editForm.feedback}
                onChange={(e) => setEditForm({ ...editForm, feedback: e.target.value })}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReview(null)}>Cancel</Button>
            <Button onClick={handleSaveReview} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModeration;
