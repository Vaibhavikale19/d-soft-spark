import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const blogs = [
  {
    title: "How to Start Learning Programming",
    excerpt: "A beginner's roadmap to picking your first language and building projects.",
    tag: "Beginner",
  },
  {
    title: "Best Programming Language for Beginners",
    excerpt: "Python vs Java vs C — which one should you learn first?",
    tag: "Guide",
  },
  {
    title: "Career Opportunities in Web Development",
    excerpt: "Explore the booming demand for frontend and full-stack developers.",
    tag: "Career",
  },
];

export default function BlogSection() {
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
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {blogs.map((b, i) => (
            <motion.article
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden glow-card group cursor-pointer"
            >
              <div className="h-40 bg-gradient-primary opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="p-6">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {b.tag}
                </span>
                <h3 className="font-display text-base font-semibold mt-3">
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">{b.excerpt}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  Read More <ArrowRight size={14} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
