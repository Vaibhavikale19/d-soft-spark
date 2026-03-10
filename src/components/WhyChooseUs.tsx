import { motion } from "framer-motion";
import { Code, UserCheck, Users, Compass } from "lucide-react";

const features = [
  { icon: Code, title: "Practical Coding Training", desc: "Hands-on projects and real-world coding exercises from day one." },
  { icon: UserCheck, title: "Experienced Instructor", desc: "Learn from Deepak Joshi with 5+ years of teaching experience." },
  { icon: Users, title: "Small Batch Size", desc: "Personalized attention with small class sizes for effective learning." },
  { icon: Compass, title: "Career Guidance", desc: "Resume building, interview prep, and placement support." },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 section-glow">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Why <span className="text-gradient">Choose Us</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 text-center glow-card group"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                <f.icon size={28} className="text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
