const { createClient } = require("@supabase/supabase-js");

let supabase = null;

function initDB() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required");
  }

  supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "public" }
  });

  return supabase;
}

function getDB() {
  if (!supabase) {
    return initDB();
  }
  return supabase;
}

module.exports = {
  initDB,
  getDB
};
