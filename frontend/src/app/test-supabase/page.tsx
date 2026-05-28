import { createClient } from "@/lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("prints").select("*").limit(5);

  return <pre>{JSON.stringify({ data, error }, null, 2)}</pre>;
}
