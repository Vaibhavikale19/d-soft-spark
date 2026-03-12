import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, UserCheck, UserX, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentProfile {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
  name?: string;
  created_at: string;
  enrollments?: {
    course: string;
    created_at: string;
  }[];
}

export default function StudentApprovals() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        enrollments (
          course,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch student profiles");
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(currentStatus ? "Student approval revoked" : "Student approved");
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleMakeAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to make this user an admin?")) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("User is now an admin");
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      toast.success("Profile deleted");
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Student Approvals & Role Management</h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
          No students registered yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-2xl glow-card glow-border border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Course(s)</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name || "N/A"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-3">
                    {p.enrollments && p.enrollments.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.enrollments.map((en, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] py-0">
                            {en.course}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">No enrollment</span>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <Badge variant={p.role === 'admin' ? 'default' : 'secondary'}>
                      {p.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.is_approved ? 'outline' : 'destructive'} className={p.is_approved ? 'border-green-500 text-green-500' : ''}>
                      {p.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={p.is_approved ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                      onClick={() => handleToggleApproval(p.id, p.is_approved)}
                      title={p.is_approved ? "Revoke Approval" : "Approve Student"}
                    >
                      {p.is_approved ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    {p.role !== 'admin' && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-primary hover:text-primary/80"
                        onClick={() => handleMakeAdmin(p.id)}
                        title="Make Admin"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDeleteProfile(p.id)}
                      title="Delete Profile"
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
    </div>
  );
}
