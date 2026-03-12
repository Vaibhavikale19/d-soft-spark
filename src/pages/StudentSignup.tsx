import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { ADMIN_EMAIL_INTERNAL } from "@/lib/auth";

const StudentSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      const currentEmail = session?.user?.email?.toLowerCase() || "";
      if (session && currentEmail === ADMIN_EMAIL_INTERNAL) {
        navigate("/admin-dashboard", { replace: true });
      } else if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  const normalizeError = (message?: string) => {
    const m = (message || "").toLowerCase();
    if (m.includes("invalid login credentials")) return "Invalid login credentials";
    if (m.includes("email not confirmed")) return "Email not confirmed";
    if (m.includes("password")) return "Wrong password";
    if (m.includes("email rate limit exceeded")) return "Supabase Email Rate Limit Exceeded. Please try again in 1 hour or disable 'Email Confirmation' in Supabase Auth settings.";
    return message || "Authentication error";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password to sign up.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(normalizeError(error.message));
      return;
    }

    if (data.session) {
      toast.success("Signup successful. Welcome!");
      navigate("/dashboard");
    } else {
      toast.info("Signup successful! Please check your email to confirm your account.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 glow-card glow-border">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">
            Student <span className="text-gradient">Signup</span>
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Create your account to access the student dashboard.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-2">
              Sign Up
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Already have an account?{" "}
            <a href="/login" className="underline text-primary">
              Go to login
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentSignup;
