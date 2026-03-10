import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Rocket } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { icon: Users, label: "100+ Students Trained" },
  { icon: BookOpen, label: "Practical Coding Courses" },
  { icon: Rocket, label: "Industry Ready Skills" },
];

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      {/* Glow overlay */}
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 bg-background/60" />

      <div className="relative z-10 container mx-auto px-4 text-center py-32">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight max-w-4xl mx-auto"
        >
          Master Programming &{" "}
          <span className="text-gradient">Build Your Tech Career</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Learn C, C++, Java, Python, Web Development and Data Structures from
          expert instructors.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 animate-pulse-glow px-8 text-base"
            asChild
          >
            <a href="#enrollment">Enroll Now</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/40 text-foreground hover:bg-primary/10 px-8 text-base"
            asChild
          >
            <a href="#courses">View Courses</a>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <s.icon size={20} className="text-primary" />
              </div>
              <span className="text-sm md:text-base text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
