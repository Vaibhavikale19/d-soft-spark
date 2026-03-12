import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { ADMIN_EMAIL } from "@/lib/auth";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      const currentEmail = session?.user?.email?.toLowerCase() || "";
      if (session && currentEmail === ADMIN_EMAIL.toLowerCase()) {
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
    return message || "Authentication error";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter admin email and password.");
      return;
    }

    const email = username.trim().toLowerCase();
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      toast.error("Access denied. This page is for admin login only.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(normalizeError(error.message));
      return;
    }

    toast.success("Logged in as Admin.");
    navigate("/admin-dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 glow-card glow-border">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">
            Admin <span className="text-gradient">Login</span>
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Restricted area for administrators only.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-username">Email</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Email"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-2" variant="destructive">
              Login as Admin
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;
