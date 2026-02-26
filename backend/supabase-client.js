// ============================================================================
// K9-REHAB-PRO — Supabase Client (server-side, service role key)
// ============================================================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required when DB_PROVIDER=supabase');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
