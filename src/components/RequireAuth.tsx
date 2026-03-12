import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin, getProfile, Profile, ADMIN_EMAIL } from "@/lib/auth";
import { Loader2 } from "lucide-react";

type Props = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireApproved?: boolean;
};

export default function RequireAuth({ children, requireAdmin, requireApproved }: Props) {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const sess = data.session ?? null;
        setSession(sess);

        if (sess?.user?.id) {
          const prof = await getProfile(sess.user.id);
          if (mounted) setProfile(prof);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(newSession);
        if (newSession?.user?.id) {
          const prof = await getProfile(newSession.user.id);
          if (mounted) setProfile(prof);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if admin by email first for ultimate reliability
  const userEmail = session.user.email?.toLowerCase();
  const isHardcodedAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
  const isUserAdmin = isHardcodedAdmin || profile?.role === "admin";

  if (requireAdmin && !isUserAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireApproved && !isUserAdmin && !profile?.is_approved) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

