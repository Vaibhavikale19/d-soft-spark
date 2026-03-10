import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password to login.");
      return;
    }

    try {
      window.localStorage.setItem("userLoggedIn", "true");
    } catch {
      // ignore storage errors
    }

    toast.success("Logged in successfully. You can now enroll.");
    navigate("/");
    setTimeout(() => {
      window.location.hash = "enrollment";
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 glow-card glow-border">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">
            User <span className="text-gradient">Login</span>
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sign in to access your student dashboard and enrollment.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserLogin;


