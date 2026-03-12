import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AboutContent {
  title: string;
  description: string;
  mission: string;
  vision: string;
  image_url: string;
}

export default function AboutSection() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("about_section")
      .select("*")
      .maybeSingle();

    if (!error && data) {
      setContent(data);
    }
    setLoading(false);
  };

  if (loading) return (
    <section id="about" className="py-24 section-glow">
      <div className="container mx-auto px-4 h-96 bg-muted animate-pulse rounded-3xl" />
    </section>
  );

  return (
    <section id="about" className="py-24 section-glow">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            About <span className="text-gradient">DSoft</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {content?.description || "Empowering students with practical programming skills and career guidance."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Institute Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="rounded-2xl overflow-hidden glow-card bg-card aspect-[4/3]">
              {content?.image_url ? (
                <img
                  src={content.image_url}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="font-display text-2xl font-semibold mb-4">
              {content?.title || "DSoft Institute of Programming"}
            </h3>
            
            <div className="space-y-6">
              {content?.mission && (
                <div>
                  <h4 className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">Our Mission</h4>
                  <p className="text-muted-foreground leading-relaxed">{content.mission}</p>
                </div>
              )}
              
              {content?.vision && (
                <div>
                  <h4 className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">Our Vision</h4>
                  <p className="text-muted-foreground leading-relaxed">{content.vision}</p>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { num: "100+", label: "Students Trained" },
                { num: "9+", label: "Courses Offered" },
                { num: "5+", label: "Years Experience" },
                { num: "95%", label: "Placement Rate" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card rounded-xl p-4 text-center glow-card glow-border border border-border"
                >
                  <div className="font-display text-2xl font-bold text-gradient">
                    {s.num}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
