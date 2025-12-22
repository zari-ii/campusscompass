import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  XCircle
} from "lucide-react";

interface PendingProfessional {
  id: string;
  name: string;
  university: string;
  department: string | null;
  category: string;
  status: string;
  created_at: string;
  created_by: string | null;
}

interface PendingReview {
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
}

const AdminModeration = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pendingProfessionals, setPendingProfessionals] = useState<PendingProfessional[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [approvedProfessionals, setApprovedProfessionals] = useState<PendingProfessional[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<PendingReview[]>([]);
  
  // Edit dialog state
  const [editingProfessional, setEditingProfessional] = useState<PendingProfessional | null>(null);
  const [editingReview, setEditingReview] = useState<PendingReview | null>(null);
  const [editForm, setEditForm] = useState({ name: "", university: "", department: "", feedback: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Fetch professionals
      const { data: professionalsData } = await supabase
        .from("professionals")
        .select("*")
        .order("created_at", { ascending: false });

      const pending = professionalsData?.filter(p => p.status === "pending") || [];
      const approved = professionalsData?.filter(p => p.status === "approved") || [];
      setPendingProfessionals(pending);
      setApprovedProfessionals(approved);

      // Fetch reviews
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

      setPendingReviews(reviewsWithNames.filter(r => r.status === "pending"));
      setApprovedReviews(reviewsWithNames.filter(r => r.status === "approved"));
    } catch (error) {
      console.error("Error fetching moderation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProfessional = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("professionals")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Professor approved", description: "The professor is now visible to users." });
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
      const { error } = await supabase
        .from("professionals")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Professor rejected", description: "The professor has been rejected." });
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

      toast({ title: "Professor deleted", description: "The professor has been permanently deleted." });
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
      const { error } = await supabase
        .from("reviews")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Review approved", description: "The review is now visible to users." });
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
      const { error } = await supabase
        .from("reviews")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Review rejected", description: "The review has been rejected." });
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

      toast({ title: "Review deleted", description: "The review has been permanently deleted." });
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditProfessional = (prof: PendingProfessional) => {
    setEditingProfessional(prof);
    setEditForm({
      name: prof.name,
      university: prof.university,
      department: prof.department || "",
      feedback: ""
    });
  };

  const openEditReview = (review: PendingReview) => {
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
      
      <main className="container py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Content Moderation</h1>
            <p className="text-muted-foreground mt-2">
              Review and approve submitted professors and reviews
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Pending Professors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingProfessionals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReviews.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approved Professors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedProfessionals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approved Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedReviews.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending-professors" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending-professors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pending Professors
                {pendingProfessionals.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{pendingProfessionals.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending-reviews" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pending Reviews
                {pendingReviews.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{pendingReviews.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved-professors">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approved Professors
              </TabsTrigger>
              <TabsTrigger value="approved-reviews">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approved Reviews
              </TabsTrigger>
            </TabsList>

            {/* Pending Professors */}
            <TabsContent value="pending-professors">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Professor Submissions</CardTitle>
                  <CardDescription>Review and approve new professor profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingProfessionals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending professors</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingProfessionals.map((prof) => (
                        <div key={prof.id} className="border rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{prof.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {prof.university} {prof.department && `• ${prof.department}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {new Date(prof.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditProfessional(prof)}
                              disabled={isSubmitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveProfessional(prof.id)}
                              disabled={isSubmitting}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectProfessional(prof.id)}
                              disabled={isSubmitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Reviews */}
            <TabsContent value="pending-reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Review Submissions</CardTitle>
                  <CardDescription>Review and approve new reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingReviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending reviews</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingReviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{review.professional_name}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  Rating: {review.overall_rating}/10
                                </span>
                              </div>
                              <p className="text-sm">{review.feedback}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Submitted: {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditReview(review)}
                                disabled={isSubmitting}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveReview(review.id)}
                                disabled={isSubmitting}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectReview(review.id)}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approved Professors */}
            <TabsContent value="approved-professors">
              <Card>
                <CardHeader>
                  <CardTitle>Approved Professors</CardTitle>
                  <CardDescription>All approved and published professors</CardDescription>
                </CardHeader>
                <CardContent>
                  {approvedProfessionals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No approved professors</p>
                  ) : (
                    <div className="space-y-4">
                      {approvedProfessionals.map((prof) => (
                        <div key={prof.id} className="border rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{prof.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {prof.university} {prof.department && `• ${prof.department}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditProfessional(prof)}
                              disabled={isSubmitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProfessional(prof.id)}
                              disabled={isSubmitting}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approved Reviews */}
            <TabsContent value="approved-reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Approved Reviews</CardTitle>
                  <CardDescription>All approved and published reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  {approvedReviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No approved reviews</p>
                  ) : (
                    <div className="space-y-4">
                      {approvedReviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{review.professional_name}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  Rating: {review.overall_rating}/10
                                </span>
                              </div>
                              <p className="text-sm">{review.feedback}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditReview(review)}
                                disabled={isSubmitting}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={isSubmitting}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

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
                rows={5}
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
