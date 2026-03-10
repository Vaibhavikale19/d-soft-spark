import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter admin username and password.");
      return;
    }

    // Simple front-end check placeholder; replace with real auth if available
    const isValidAdmin = username.toLowerCase() === "admin";

    if (!isValidAdmin) {
      toast.error("Invalid admin credentials.");
      return;
    }

    try {
      window.localStorage.setItem("adminLoggedIn", "true");
    } catch {
      // ignore storage errors
    }

    toast.success("Logged in as admin. You can now manage gallery images.");
    navigate("/");
    setTimeout(() => {
      window.location.hash = "gallery";
    }, 0);
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
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="admin"
                autoComplete="username"
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

