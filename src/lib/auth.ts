import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { NavigateFunction } from "react-router-dom";

const env = import.meta.env || {};
export const ADMIN_EMAIL = "dsoft.programming28@gmail.com";
export const ADMIN_EMAIL_INTERNAL = "dsoft.programming28@gmail.com";

export type ProfileRole = "admin" | "student";

export interface Profile {
  id: string;
  email: string;
  role: ProfileRole;
  is_approved: boolean;
  name?: string;
}

export function isAdmin(user: User | null | undefined, profile?: Profile | null) {
  const email = user?.email?.toLowerCase();
  if (!!email && email === ADMIN_EMAIL.toLowerCase()) return true;
  if (profile) return profile.role === "admin";
  return false;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function logout(navigate?: NavigateFunction) {
  const { error } = await supabase.auth.signOut();
  if (!error && navigate) {
    navigate("/login");
  }
  return error;
}
