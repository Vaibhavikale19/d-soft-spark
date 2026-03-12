import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill required fields");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      course_interest: form.course,
      user_id: user?.id || null,
    };

    const { error } = await supabase.from("inquiries").insert([payload]);
    if (error) {
      toast.error(error.message || "Failed to submit inquiry.");
      return;
    }

    toast.success("Inquiry submitted! We'll contact you soon.");
    setForm({ name: "", email: "", phone: "", course: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 section-glow">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Get In <span className="text-gradient">Touch</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Input
              placeholder="Your Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-card border-border"
            />
            <Input
              type="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-card border-border"
            />
            <Input
              placeholder="Phone Number *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-card border-border"
            />
            <Input
              placeholder="Course Interested In"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="bg-card border-border"
            />
            <Textarea
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-card border-border min-h-[100px]"
            />
            <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              Send Inquiry
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Address</h4>
                <p className="text-sm text-muted-foreground">Tahsil Ward, Hinganghat, Maharashtra, India</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Phone size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Phone</h4>
                <p className="text-sm text-muted-foreground">+91 9834521983</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Email</h4>
                <p className="text-sm text-muted-foreground">info@dsoftcoaching.com</p>
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-2xl overflow-hidden mt-4">
              <iframe
                title="D-Soft Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14914.252!2d78.8367!3d20.5468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd35e9a34b5f0d9%3A0x8e0c9a6f38b79b14!2sHinganghat%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
