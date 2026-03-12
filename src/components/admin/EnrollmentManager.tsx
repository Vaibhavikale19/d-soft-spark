import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Clock, Trash2, RefreshCw, Eye, UserCheck, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Enrollment {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function EnrollmentManager() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchEnrollments();

    // Set up real-time subscription
    const channel = supabase
      .channel('enrollments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments'
        },
        () => {
          fetchEnrollments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch enrollments error:", error);
        toast.error("Failed to fetch enrollments: " + error.message);
      } else {
        console.log("Fetched enrollments count:", data?.length || 0);
        setEnrollments(data || []);
      }
    } catch (err: any) {
      console.error("Unexpected fetch error:", err);
      toast.error("An unexpected error occurred while fetching enrollments.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected', userId?: string) => {
    console.log(`Updating enrollment ${id} to ${status} for user ${userId}`);
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;

      // If approved, also approve the student profile
      if (status === 'approved' && userId) {
        console.log(`Updating profile ${userId} to approved`);
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            is_approved: true,
            role: 'student' // Ensure they have the student role
          })
          .eq("id", userId);
        
        if (profileError) {
          console.error("Profile update error:", profileError);
          toast.warning("Enrollment approved, but failed to update student access. Please check 'Student Approvals' section.");
        } else {
          toast.success("Enrollment approved and student access granted!");
        }
      } else {
        toast.success(`Enrollment ${status} successfully`);
      }

      if (selectedEnrollment?.id === id) {
        setSelectedEnrollment({ ...selectedEnrollment, status });
      }
      fetchEnrollments();
    } catch (error: any) {
      console.error("Enrollment update error:", error);
      toast.error("Error updating status: " + error.message);
    }
  };

  const deleteEnrollment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enrollment?")) return;
    try {
      const { error, count } = await supabase
        .from("enrollments")
        .delete({ count: 'exact' })
        .eq("id", id);
      
      if (error) throw error;

      if (count === 0) {
        toast.error("Permission denied: You do not have access to delete this enrollment.");
        console.error("Delete failed: 0 rows affected. Check RLS policies.");
      } else {
        toast.success("Enrollment deleted successfully");
        fetchEnrollments();
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Error deleting enrollment: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected', userId?: string) => {
    await updateStatus(id, status, userId);
  };

  const filteredEnrollments = enrollments.filter(e => {
    const s = (e.status || 'pending').toLowerCase();
    return s === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold uppercase tracking-tight">Student Enrollments</h2>
        <Button variant="outline" size="sm" onClick={fetchEnrollments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending" className="relative">
            Pending
            {enrollments.filter(e => (e.status || 'pending').toLowerCase() === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {enrollments.filter(e => (e.status || 'pending').toLowerCase() === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading && enrollments.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
              No {activeTab} enrollments found.
            </div>
          ) : (
            <div className="overflow-x-auto bg-card rounded-2xl glow-card glow-border border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr className="text-left">
                    <th className="px-4 py-3">Student Info</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((e) => (
                    <tr key={e.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{e.phone || "N/A"}</td>
                      <td className="px-4 py-3 font-medium text-primary">{e.course}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]" title={e.message}>
                          {e.message || "No message"}
                        </p>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(e.status)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button size="icon" variant="ghost" onClick={() => setSelectedEnrollment(e)} title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(e.status || 'pending').toLowerCase() === 'pending' && (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleUpdateStatus(e.id, 'approved', e.user_id)}
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive hover:bg-red-50"
                              onClick={() => handleUpdateStatus(e.id, 'rejected')}
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteEnrollment(e.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enrollment Detail Dialog */}
      <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedEnrollment && new Date(selectedEnrollment.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEnrollment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Student Name</label>
                  <p className="font-medium">{selectedEnrollment.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Phone</label>
                  <p className="font-medium">{selectedEnrollment.phone || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Email</label>
                  <p className="font-medium">{selectedEnrollment.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Course Selected</label>
                  <p className="font-medium text-primary text-lg">{selectedEnrollment.course}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold">Message / Notes</label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm italic min-h-[60px]">
                  "{selectedEnrollment.message || "No specific message provided."}"
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <label className="text-xs text-muted-foreground uppercase font-semibold">Admin Actions</label>
                {selectedEnrollment.status === 'pending' ? (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus(selectedEnrollment.id, 'approved', selectedEnrollment.user_id)}
                    >
                      <Check className="w-4 h-4 mr-2" /> Approve Enrollment
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => updateStatus(selectedEnrollment.id, 'rejected')}
                    >
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-center font-medium">
                    Current Status: {getStatusBadge(selectedEnrollment.status)}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => setSelectedEnrollment(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
