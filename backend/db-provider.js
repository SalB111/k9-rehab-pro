// ============================================================================
// K9-REHAB-PRO — Database Provider Toggle
// Set DB_PROVIDER=supabase in .env to use Supabase (local or hosted)
// Default: sqlite (backward compatible, zero-config)
// ============================================================================

const provider = process.env.DB_PROVIDER || 'sqlite';

if (provider === 'supabase') {
  module.exports = require('./db-providers/supabase-provider');
} else {
  module.exports = require('./db-providers/sqlite-provider');
}
