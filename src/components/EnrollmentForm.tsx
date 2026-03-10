import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.course) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Enrollment submitted successfully! We'll contact you soon.");
    setForm({ name: "", email: "", phone: "", city: "", course: "", education: "", batch: "", message: "" });
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
