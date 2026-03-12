import React, { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import logo from "@/assets/logo.png";
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
import { supabase } from "@/lib/supabaseClient";
import { isAdmin, getProfile, Profile } from "@/lib/auth";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Courses", href: "/#courses" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Blog", href: "/#blog" },
  { label: "Contact", href: "/#contact" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const prof = await getProfile(uid);
    setProfile(prof);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleEnrollClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      event.preventDefault();
      setLoginOpen(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const handler = () => setLoginOpen(true);

    window.addEventListener("open-login-dialog", handler);
    return () => window.removeEventListener("open-login-dialog", handler);
  }, []);

  const handleInlineLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password to login.");
      return;
    }

    const trimmedEmail = loginEmail.trim().toLowerCase();
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase()) {
      toast.error("Admin detected. Please use the Admin Login page.");
      setLoginOpen(false);
      navigate("/admin/login");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: loginPassword,
    });
    
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("invalid login credentials")) {
        toast.error("Invalid email or password.");
      } else if (m.includes("email not confirmed")) {
        toast.error("Please confirm your email before logging in.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (data.session) {
      toast.success("Logged in successfully.");
      setLoginOpen(false);
      setLoginPassword("");
      if (!window.location.hash || window.location.hash !== "#enrollment") {
        window.location.hash = "enrollment";
      }
    }
  };

  const isUserAdmin = isAdmin(session?.user, profile);
  const dashboardLink = isUserAdmin ? "/admin-dashboard" : "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display text-xl font-bold text-gradient">
          D-Soft
        </Link>

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
          
          {session ? (
            <div className="flex items-center gap-2">
              <Link to={dashboardLink}>
                <Button size="sm" variant="ghost" className="gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
              </Link>
              <Button size="icon" variant="ghost" onClick={handleLogout} title="Logout">
                <LogOut size={16} className="text-destructive" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button
                size="sm"
                variant="outline"
                className="border-primary/60 text-primary hover:bg-primary/10"
              >
                Login
              </Button>
            </Link>
          )}
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
            onClick={async (e) => {
              const success = await handleEnrollClick(e);
              if (success) setOpen(false);
            }}
          >
            <Button size="sm" className="mt-2 w-full bg-gradient-primary text-primary-foreground">
              Enroll Now
            </Button>
          </a>
          
          {session ? (
            <>
              <Link to={dashboardLink} onClick={() => setOpen(false)}>
                <Button size="sm" variant="ghost" className="mt-2 w-full gap-2 justify-start">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="mt-2 w-full gap-2 justify-start text-destructive">
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full border-primary/60 text-primary hover:bg-primary/10"
              >
                Login
              </Button>
            </Link>
          )}
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
            New here?{" "}
            <a href="/student-signup" className="underline text-primary font-semibold">
              Create an account to enroll
            </a>
          </p>
          <p className="mt-2 text-xs text-muted-foreground text-center">
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
