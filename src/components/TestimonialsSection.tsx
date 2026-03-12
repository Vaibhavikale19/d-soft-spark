import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Testimonial {
  id: string;
  student_name: string;
  course: string;
  review_text: string;
  rating: number;
  student_image?: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
    setLoading(false);
  };

  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Student <span className="text-gradient">Reviews</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Hear what our students have to say about their learning experience at DSoft.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No reviews yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 glow-card glow-border border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className={j < t.rating ? "fill-primary text-primary" : "text-muted"} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "{t.review_text}"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {t.student_image ? (
                    <img src={t.student_image} alt={t.student_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                      {t.student_name[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">{t.student_name}</div>
                    <div className="text-xs text-muted-foreground">{t.course}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
