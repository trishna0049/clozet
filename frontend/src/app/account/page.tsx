"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoggedInAccountPage from "./logged-in";

export default function AccountPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }
      
      setSession(data.session);
      setLoading(false);
    };
    
    checkSession();
  }, [supabase.auth, router]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Show account page only if logged in
  return session ? <LoggedInAccountPage /> : null;
}
