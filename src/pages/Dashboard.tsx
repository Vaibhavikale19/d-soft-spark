import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle2, Clock } from "lucide-react";
import { getProfile, Profile } from "@/lib/auth";

type Enrollment = {
  id: string;
  course: string;
  created_at: string;
};

type Inquiry = {
  id: string;
  message: string;
  created_at: string;
};

export default function Dashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Testimonial Form State
  const [testimonial, setTestimonial] = useState({
    review_text: "",
    rating: 5,
    course: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmittedTestimonial, setHasSubmittedTestimonial] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || null);

      const [enrollRes, inquiryRes, prof, testimonialRes] = await Promise.all([
        supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("inquiries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        getProfile(user.id),
        supabase
          .from("testimonials")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
      ]);

      if (enrollRes.error) throw enrollRes.error;
      if (inquiryRes.error) throw inquiryRes.error;

      setEnrollments(enrollRes.data || []);
      setInquiries(inquiryRes.data || []);
      setProfile(prof);
      setHasSubmittedTestimonial(!!testimonialRes.data);
      
      if (enrollRes.data?.[0]) {
        setTestimonial(prev => ({ ...prev, course: enrollRes.data[0].course }));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.is_approved) {
      toast.error("Only approved students can submit testimonials.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase.from("testimonials").insert([{
        user_id: user.id,
        student_name: profile.name || user.email?.split('@')[0],
        course: testimonial.course,
        review_text: testimonial.review_text,
        rating: testimonial.rating,
        is_approved: false // Requires admin approval
      }]);

      if (error) throw error;
      
      toast.success("Testimonial submitted! It will appear on the website after admin approval.");
      setHasSubmittedTestimonial(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/dashboard`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent to your email.");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Failed to logout.");
      return;
    }
    toast.success("Logged out.");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 glow-card glow-border mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h1 className="font-display text-2xl md:text-4xl font-bold">
                  My <span className="text-gradient">Dashboard</span>
                </h1>
                {profile?.is_approved && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Approved Student
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handlePasswordReset}>
                  Reset Password
                </Button>
                <Button variant="outline" size="sm" className="border-primary/60 text-primary hover:bg-primary/10" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-8">
              Welcome back, <strong>{userEmail}</strong>! View your submissions below.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Enrollments
                </h2>
                
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : enrollments.length === 0 ? (
                  <div className="bg-secondary/20 rounded-xl p-6 text-center border border-dashed border-border">
                    <p className="text-sm text-muted-foreground mb-4">No enrollments yet.</p>
                    <Button size="sm" onClick={() => window.location.href = "/#enrollment"} className="bg-gradient-primary">
                      Enroll Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((e) => (
                      <div key={e.id} className="bg-secondary/50 p-4 rounded-lg border border-border">
                        <h3 className="font-bold text-primary">{e.course}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Inquiries
                </h2>
                
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : inquiries.length === 0 ? (
                  <div className="bg-secondary/20 rounded-xl p-6 text-center border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">No inquiries yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((i) => (
                      <div key={i.id} className="bg-secondary/50 p-4 rounded-lg border border-border">
                        <p className="text-sm line-clamp-2">{i.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(i.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Testimonial Section for Approved Students */}
          {profile?.is_approved && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-8 glow-card glow-border"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> 
                Submit Your <span className="text-gradient">Review</span>
              </h2>

              {hasSubmittedTestimonial ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Thank you for your review!</h3>
                  <p className="text-muted-foreground">
                    Your testimonial has been received and is currently being reviewed by our team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTestimonialSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Input 
                        value={testimonial.course} 
                        onChange={(e) => setTestimonial({ ...testimonial, course: e.target.value })}
                        placeholder="e.g. Web Development"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTestimonial({ ...testimonial, rating: star })}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star 
                              className={`w-8 h-8 ${star <= testimonial.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Your Feedback</Label>
                    <div className="relative">
                      <Textarea 
                        value={testimonial.review_text} 
                        onChange={(e) => setTestimonial({ ...testimonial, review_text: e.target.value })}
                        placeholder="Share your learning experience at DSoft..."
                        className="min-h-[120px] pr-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : (
                      <>
                        Submit Review <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

