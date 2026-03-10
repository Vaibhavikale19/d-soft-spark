import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919834521983?text=Hi%2C%20I%27m%20interested%20in%20D-Soft%20courses"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse-glow"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} className="text-foreground" />
    </a>
  );
}
