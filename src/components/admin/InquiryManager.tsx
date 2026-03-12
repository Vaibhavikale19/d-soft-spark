import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clock, Trash2, RefreshCw, Eye, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  course_interest: string;
  status: 'pending' | 'contacted' | 'resolved';
  created_at: string;
}

export default function InquiryManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes("relation \"public.inquiries\" does not exist")) {
          toast.error("Database table 'inquiries' is missing. Please run the SQL setup script.");
        } else {
          toast.error("Failed to fetch inquiries: " + error.message);
        }
      } else {
        setInquiries(data || []);
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();

    const channel = supabase
      .channel('inquiries-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => fetchInquiries()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: 'contacted' | 'resolved') => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(`Inquiry marked as ${status}`);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
      fetchInquiries();
    } catch (error: any) {
      toast.error("Error updating inquiry: " + error.message);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const { error, count } = await supabase
        .from("inquiries")
        .delete({ count: 'exact' })
        .eq("id", id);
      
      if (error) throw error;
      
      if (count === 0) {
        toast.error("Permission denied: You do not have access to delete this inquiry.");
        console.error("Delete failed: 0 rows affected. Check RLS policies.");
      } else {
        toast.success("Inquiry deleted successfully");
        fetchInquiries();
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Error deleting inquiry: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-500">Contacted</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> New</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold uppercase tracking-tight">General Inquiries</h2>
        <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading && inquiries.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
          No inquiries found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-2xl glow-card glow-border border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left">
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Interested In</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.phone || "N/A"}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]" title={i.message}>
                      {i.message || "No message"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">{i.course_interest || "General"}</Badge>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(i.status)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(i.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => setSelectedInquiry(i)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteInquiry(i.id)}
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

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Received on {selectedInquiry && new Date(selectedInquiry.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Name</label>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Phone</label>
                  <p className="font-medium">{selectedInquiry.phone || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Email</label>
                  <p className="font-medium">{selectedInquiry.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Interested In</label>
                  <p className="font-medium text-primary">{selectedInquiry.course_interest || "General Inquiry"}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold">Message</label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm italic">
                  "{selectedInquiry.message}"
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <label className="text-xs text-muted-foreground uppercase font-semibold">Update Status</label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    disabled={selectedInquiry.status === 'contacted'}
                    onClick={() => updateStatus(selectedInquiry.id, 'contacted')}
                  >
                    Mark Contacted
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                    disabled={selectedInquiry.status === 'resolved'}
                    onClick={() => updateStatus(selectedInquiry.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => setSelectedInquiry(null)}
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
