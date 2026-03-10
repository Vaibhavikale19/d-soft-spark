import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const defaultImages = [
  { src: gallery1, alt: "Students learning coding" },
  { src: gallery2, alt: "Coding on laptop" },
  { src: gallery3, alt: "Classroom teaching" },
  { src: gallery4, alt: "Student success celebration" },
];

export default function GallerySection() {
  const [images, setImages] = useState<{ src: string; alt: string }[]>(defaultImages);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const admin = window.localStorage.getItem("adminLoggedIn") === "true";
      setIsAdmin(admin);

      const stored = window.localStorage.getItem("galleryImages");
      if (stored) {
        const parsed = JSON.parse(stored) as { src: string; alt: string }[];
        if (Array.isArray(parsed) && parsed.length) {
          setImages([...defaultImages, ...parsed]);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const readers: Promise<{ src: string; alt: string }>[] = [];

    Array.from(files).forEach((file) => {
      readers.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              src: typeof reader.result === "string" ? reader.result : "",
              alt: file.name || "User uploaded image",
            });
          };
          reader.readAsDataURL(file);
        })
      );
    });

    Promise.all(readers).then((newImages) => {
      setImages((prev) => {
        const userImages = newImages.filter((img) => img.src);
        const updated = [...prev, ...userImages];
        try {
          const storedUserImages = updated.slice(defaultImages.length);
          window.localStorage.setItem("galleryImages", JSON.stringify(storedUserImages));
        } catch {
          // ignore storage errors
        }
        return updated;
      });
    });
  };

  return (
    <section id="gallery" className="py-24 section-glow">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Our <span className="text-gradient">Gallery</span>
          </h2>
        </motion.div>

        {isAdmin && (
          <div className="max-w-5xl mx-auto mb-8 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground text-center">
              Admin: add photos to this gallery from your device. Images stay on this browser only.
            </p>
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer px-4 py-2 rounded-full border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="text-primary">+ Add Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddImages}
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {images.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
