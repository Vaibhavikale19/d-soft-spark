export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="font-display text-lg font-bold text-gradient mb-2">
          D-Soft Coaching & Counselling Center
        </p>
        <p className="text-sm text-muted-foreground">
          Tahsil Ward, Hinganghat, Maharashtra, India
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} D-Soft. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
