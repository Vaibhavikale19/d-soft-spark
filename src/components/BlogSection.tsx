import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  category: string;
  created_at: string;
}

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error && data) {
      setBlogs(data);
    }
    setLoading(false);
  };

  return (
    <section id="blog" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Blog & <span className="text-gradient">Insights</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest trends in technology and student success stories.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No blog posts published yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {blogs.map((b, i) => (
              <motion.article
                key={b.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden glow-card glow-border border border-border group cursor-pointer"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={b.cover_image} 
                    alt={b.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {b.category}
                  </span>
                  <h3 className="font-display text-lg font-bold mt-3 line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{b.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={14} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
