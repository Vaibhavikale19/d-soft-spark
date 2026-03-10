import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Braces,
  Coffee,
  Terminal,
  Globe,
  Database,
  FileSpreadsheet,
  Calculator,
  Keyboard,
} from "lucide-react";

const courses = [
  { title: "C++", desc: "Object-oriented programming, STL, and modern C++ features.", duration: "3 Months", icon: Code2 },
  { title: "C Programming", desc: "Master fundamentals of procedural programming with C.", duration: "2 Months", icon: Terminal },
  { title: "Java", desc: "Core Java, OOP concepts, collections, and project building.", duration: "3 Months", icon: Coffee },
  { title: "Python", desc: "Python basics to advanced — scripting, automation & data.", duration: "3 Months", icon: Braces },
  { title: "Web Development", desc: "HTML, CSS, JavaScript, React — build modern websites.", duration: "4 Months", icon: Globe },
  { title: "Data Structures", desc: "Arrays, linked lists, trees, graphs & algorithm design.", duration: "3 Months", icon: Database },
  { title: "MS Office", desc: "Word, Excel, PowerPoint — essential office productivity.", duration: "1 Month", icon: FileSpreadsheet },
  { title: "Tally", desc: "Accounting software for GST, inventory & financial reports.", duration: "2 Months", icon: Calculator },
  { title: "Typing Course", desc: "English & Hindi typing — speed and accuracy training.", duration: "1 Month", icon: Keyboard },
];

export default function CoursesSection() {
  const handleEnroll = (course: string) => {
    try {
      window.localStorage.setItem("preferredCourse", course);
    } catch {
      // Ignore storage errors (e.g., in private mode)
    }

    let loggedIn = false;
    try {
      loggedIn = window.localStorage.getItem("userLoggedIn") === "true";
    } catch {
      loggedIn = false;
    }

    if (loggedIn) {
      window.location.hash = "enrollment";
    } else {
      try {
        window.dispatchEvent(new CustomEvent("open-login-dialog"));
      } catch {
        // ignore dispatch errors
      }
    }
  };

  return (
    <section id="courses" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Our <span className="text-gradient">Courses</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Industry-relevant courses designed for beginners and intermediate
            learners.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {courses.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-6 glow-card glow-border relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <c.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-primary font-medium">
                  {c.duration}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:bg-primary/10 text-xs"
                  onClick={() => handleEnroll(c.title)}
                >
                  Enroll →
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
