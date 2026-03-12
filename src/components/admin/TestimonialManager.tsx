import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit, Check, X, Star, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Testimonial {
  id: string;
  student_name: string;
  course: string;
  review_text: string;
  rating: number;
  student_image?: string;
  is_approved: boolean;
  created_at: string;
}

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    id: "",
    student_name: "",
    course: "",
    review_text: "",
    rating: 5
  });

  const [addFormData, setAddFormData] = useState({
    student_name: "",
    course: "",
    review_text: "",
    rating: 5,
    is_approved: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch testimonials");
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("testimonials")
        .insert([addFormData]);

      if (error) throw error;
      toast.success("Testimonial added successfully");
      setIsAddOpen(false);
      setAddFormData({
        student_name: "",
        course: "",
        review_text: "",
        rating: 5,
        is_approved: true
      });
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message || "Failed to add testimonial");
    }
  };

  const handleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_approved: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(currentStatus ? "Testimonial hidden from website" : "Testimonial approved and live!");
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          student_name: formData.student_name,
          course: formData.course,
          review_text: formData.review_text,
          rating: formData.rating
        })
        .eq("id", formData.id);

      if (error) throw error;
      toast.success("Testimonial updated");
      setIsEditOpen(false);
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message || "Failed to update testimonial");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete testimonial");
    }
  };

  const openEditDialog = (t: Testimonial) => {
    setFormData(t);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Student Testimonials Manager</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTestimonials} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" className="bg-gradient-primary" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Testimonial
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
          No testimonials yet. Click "Add Testimonial" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className={`flex gap-4 p-4 bg-card rounded-xl glow-border border border-border group ${!t.is_approved ? 'opacity-70 bg-muted/20' : ''}`}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                {t.student_image ? (
                  <img src={t.student_image} alt={t.student_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-primary">{t.student_name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{t.student_name}</h3>
                  <Badge variant="outline" className="text-[10px] py-0">{t.course}</Badge>
                  <div className="flex items-center ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                    ))}
                  </div>
                  <div className="ml-auto">
                    {t.is_approved ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-[10px] py-0">LIVE</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] py-0">PENDING</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic line-clamp-2">"{t.review_text}"</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost"
                  className={t.is_approved ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"}
                  onClick={() => handleApprove(t.id, t.is_approved)}
                  title={t.is_approved ? "Hide from website" : "Approve and show on website"}
                >
                  {t.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(t)} title="Edit testimonial">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleDelete(t.id)} title="Delete testimonial">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Testimonial Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Testimonial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input 
                value={addFormData.student_name} 
                onChange={(e) => setAddFormData({ ...addFormData, student_name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Input 
                value={addFormData.course} 
                onChange={(e) => setAddFormData({ ...addFormData, course: e.target.value })}
                placeholder="e.g. Web Development"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setAddFormData({ ...addFormData, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= addFormData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Review Text</Label>
              <Textarea 
                value={addFormData.review_text} 
                onChange={(e) => setAddFormData({ ...addFormData, review_text: e.target.value })}
                placeholder="Write the testimonial content here..."
                className="min-h-[100px]"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary">
              Add Testimonial
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input 
                value={formData.student_name} 
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Input 
                value={formData.course} 
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <Input 
                type="number" 
                min="1" 
                max="5" 
                value={formData.rating} 
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Review Text</Label>
              <Textarea 
                value={formData.review_text} 
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Update Testimonial
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
