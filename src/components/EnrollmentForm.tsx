import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const courseOptions = [
  "C Programming", "C++", "Java", "Python", "Web Development",
  "Data Structures", "MS Office", "Tally", "Typing Course",
];

const batchTimes = ["Morning (9 AM - 12 PM)", "Afternoon (1 PM - 4 PM)", "Evening (5 PM - 8 PM)"];

export default function EnrollmentForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "",
    course: "", education: "", batch: "", message: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setForm(prev => ({
          ...prev,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.full_name || prev.name
        }));
        
        // Also try to get name from profiles
        supabase.from("profiles").select("name").eq("id", session.user.id).maybeSingle().then(({ data }) => {
          if (data?.name) {
            setForm(prev => ({ ...prev, name: data.name }));
          }
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    // 2. Pre-fill from localStorage (Course selection from UI)
    try {
      const preferredCourse = window.localStorage.getItem("preferredCourse");
      if (preferredCourse) {
        setForm((prev) => ({ ...prev, course: preferredCourse }));
      }
    } catch {
      // Ignore storage errors
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.course) {
      toast.error("Please fill all required fields");
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        toast.error("Please login first to submit the enrollment form.");
        try {
          window.dispatchEvent(new CustomEvent("open-login-dialog"));
        } catch {
          // ignore dispatch errors
        }
        return;
      }

      const user = session.user;
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        course: form.course,
        message: form.message,
        user_id: user.id,
      };

      const { error: insertError } = await supabase.from("enrollments").insert([payload]);

      if (insertError) {
        toast.error(insertError.message || "Failed to submit enrollment.");
        return;
      }

      // Also ensure student profile exists with "student" role and is initially not approved
      await supabase.from("profiles").upsert([
        { 
          id: user.id, 
          email: user.email, 
          role: "student", 
          name: form.name,
          is_approved: false 
        }
      ], { onConflict: 'id' });

      toast.success("Enrollment submitted successfully! Check your dashboard to see your status.");
      try {
        window.localStorage.removeItem("preferredCourse");
      } catch {
        // Ignore storage errors
      }
      setForm({ name: "", email: "", phone: "", city: "", course: "", education: "", batch: "", message: "" });
    });
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <section id="enrollment" className="py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            <span className="text-gradient">Enroll</span> Now
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fill the form below to register for a course.
          </p>
          {!isLoggedIn && (
            <p className="mt-2 text-xs text-primary font-semibold">
              Tip: Login or <a href="/student-signup" className="underline hover:text-primary/80">Sign Up</a> first to save time!
            </p>
          )}
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl p-8 space-y-4 glow-card"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Full Name *" value={form.name} onChange={update("name")} className="bg-secondary border-border" />
            <Input type="email" placeholder="Email *" value={form.email} onChange={update("email")} className="bg-secondary border-border" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Phone Number *" value={form.phone} onChange={update("phone")} className="bg-secondary border-border" />
            <Input placeholder="City" value={form.city} onChange={update("city")} className="bg-secondary border-border" />
          </div>
          <select
            value={form.course}
            onChange={update("course")}
            className="w-full h-10 rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
          >
            <option value="">Select Course *</option>
            {courseOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Input placeholder="Education Qualification" value={form.education} onChange={update("education")} className="bg-secondary border-border" />
          <select
            value={form.batch}
            onChange={update("batch")}
            className="w-full h-10 rounded-md bg-secondary border border-border px-3 text-sm text-foreground"
          >
            <option value="">Preferred Batch Time</option>
            {batchTimes.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <Textarea placeholder="Message (optional)" value={form.message} onChange={update("message")} className="bg-secondary border-border" />
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 text-base h-12">
            Submit Enrollment
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
