import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Who can join D-Soft courses?", a: "Anyone from school students to working professionals. No prior coding experience is required for beginner courses." },
  { q: "What is the batch size?", a: "We maintain small batches of 8-10 students for personalized attention and effective learning." },
  { q: "Do you provide certificates?", a: "Yes, we provide course completion certificates recognized by industry standards." },
  { q: "What are the class timings?", a: "We offer Morning (9-12), Afternoon (1-4), and Evening (5-8) batches. Weekend batches are also available." },
  { q: "Is placement assistance provided?", a: "Yes, we help with resume building, interview preparation, and connect students with local and remote job opportunities." },
  { q: "Can I download the course syllabus?", a: "Yes, you can request the detailed syllabus by contacting us via WhatsApp or the contact form." },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-24 section-glow">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card rounded-xl border-none px-6"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
