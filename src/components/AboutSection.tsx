import { motion } from "framer-motion";
import instructorImg from "@/assets/instructor.jpg";

export default function AboutSection() {
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
            About <span className="text-gradient">D-Soft</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            D-Soft Coaching & Counselling Center in Hinganghat is dedicated to
            empowering students with practical programming skills and career
            guidance in the tech industry.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Instructor card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="rounded-2xl overflow-hidden glow-card bg-card">
              <img
                src={instructorImg}
                alt="Deepak Joshi - Programming Coach"
                className="w-full h-80 object-cover object-top"
              />
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold">
                  Deepak Joshi
                </h3>
                <p className="text-primary text-sm mt-1">Programming Coach</p>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="font-display text-2xl font-semibold mb-4">
              Meet Your Instructor
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Expert in C++, Java, Python, Web Development and MS Office with
              experience training 100+ students and helping beginners start
              their coding journey. Deepak believes in hands-on, project-based
              learning that prepares students for real-world challenges.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { num: "100+", label: "Students Trained" },
                { num: "9+", label: "Courses Offered" },
                { num: "5+", label: "Years Experience" },
                { num: "95%", label: "Placement Rate" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card rounded-xl p-4 text-center glow-card"
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
