import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Gallery", href: "#gallery" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleEnrollClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    let loggedIn = false;
    try {
      loggedIn = window.localStorage.getItem("userLoggedIn") === "true";
    } catch {
      loggedIn = false;
    }

    if (!loggedIn) {
      event.preventDefault();
      setLoginOpen(true);
    }
  };

  useEffect(() => {
    const handler = () => setLoginOpen(true);

    window.addEventListener("open-login-dialog", handler);
    return () => window.removeEventListener("open-login-dialog", handler);
  }, []);

  const handleInlineLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password to login.");
      return;
    }

    try {
      window.localStorage.setItem("userLoggedIn", "true");
    } catch {
      // ignore storage errors
    }

    toast.success("Logged in successfully. You can now enroll.");
    setLoginOpen(false);
    setLoginPassword("");
    if (!window.location.hash || window.location.hash !== "#enrollment") {
      window.location.hash = "enrollment";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#home" className="font-display text-xl font-bold text-gradient">
          D-Soft
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a href="#enrollment" onClick={handleEnrollClick}>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              Enroll Now
            </Button>
          </a>
          <a href="/login">
            <Button
              size="sm"
              variant="outline"
              className="border-primary/60 text-primary hover:bg-primary/10"
            >
              Login
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4 animate-fade-up">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#enrollment"
            onClick={(e) => {
              handleEnrollClick(e);
              if (window.localStorage.getItem("userLoggedIn") === "true") {
                setOpen(false);
              }
            }}
          >
            <Button size="sm" className="mt-2 w-full bg-gradient-primary text-primary-foreground">
              Enroll Now
            </Button>
          </a>
          <a href="/login" onClick={() => setOpen(false)}>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full border-primary/60 text-primary hover:bg-primary/10"
            >
              Login
            </Button>
          </a>
        </div>
      )}

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Login</DialogTitle>
            <DialogDescription>
              Please login to continue with enrollment. The page will stay where you are.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 mt-2" onSubmit={handleInlineLoginSubmit}>
            <div className="space-y-2">
              <Label htmlFor="navbar-login-email">Email</Label>
              <Input
                id="navbar-login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="navbar-login-password">Password</Label>
              <Input
                id="navbar-login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-2">
              Login
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Admin?{" "}
            <a href="/admin/login" className="underline text-primary">
              Go to admin login
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
