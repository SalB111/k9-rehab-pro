// ============================================================================
// K9-REHAB-PRO — Supabase Provider
// Same interface as sqlite-provider, backed by Supabase (local or hosted).
// ============================================================================

let supabase;

// ── Initialize ──────────────────────────────────────────────────────────────

async function initialize() {
  supabase = require('../supabase-client');
  console.log('✅ Connected to Supabase');
}

async function createTables() {
  // Tables created by migration (supabase db reset)
  console.log('✅ Supabase tables managed by migrations');
}

// ── Seed Data ───────────────────────────────────────────────────────────────

async function seedConditions(conditionsList) {
  const { count } = await supabase.from('conditions').select('*', { count: 'exact', head: true });
  if (count > 0) return;

  const rows = conditionsList.map(c => ({
    code: c.code, name: c.name, category: c.category,
    severity: c.severity || null, description: c.description || null,
    typical_recovery_weeks: c.typical_recovery_weeks || 8,
    recommended_exercises: c.recommended_exercises || null,
    contraindicated_exercises: c.contraindicated_exercises || null,
    special_considerations: c.special_considerations || null
  }));

  const { error } = await supabase.from('conditions').insert(rows);
  if (error) throw error;
  console.log(`✅ Seeded ${rows.length} conditions`);
}

async function seedExercises(exercisesList) {
  const { count } = await supabase.from('exercises').select('*', { count: 'exact', head: true });
  if (count > 0) return;

  const rows = exercisesList.map(ex => ({
    code: ex.code, name: ex.name, category: ex.category || 'General',
    description: ex.description || null,
    equipment: JSON.stringify(ex.equipment || []),
    setup: ex.setup || null,
    steps: JSON.stringify(ex.steps || []),
    good_form: JSON.stringify(ex.good_form || []),
    common_mistakes: JSON.stringify(ex.common_mistakes || []),
    red_flags: JSON.stringify(ex.red_flags || []),
    progression: ex.progression || null,
    contraindications: ex.contraindications || null,
    difficulty_level: ex.difficulty_level || 'Moderate'
  }));

  // Insert in batches of 50 (Supabase limit)
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from('exercises').insert(batch);
    if (error) throw error;
  }
  console.log(`✅ Seeded ${rows.length} exercises`);
}

async function seedExerciseLibrary() {
  const { count } = await supabase.from('domains').select('*', { count: 'exact', head: true });
  if (count > 0) {
    console.log('✅ Exercise library already seeded');
    return;
  }
  // Seeding is handled by seed-supabase.js script
  console.log('⚠️  Exercise library v2 not seeded — run: node seed-supabase.js');
}

// ── Patients ────────────────────────────────────────────────────────────────

async function getAllPatients() {
  const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function createPatient(patientData) {
  const { data, error } = await supabase.from('patients').insert([{
    name: patientData.name, breed: patientData.breed,
    age: patientData.age, weight: patientData.weight,
    sex: patientData.sex, condition: patientData.condition,
    affected_region: patientData.affected_region,
    surgery_date: patientData.surgery_date,
    lameness_grade: patientData.lameness_grade,
    body_condition_score: patientData.body_condition_score,
    pain_level: patientData.pain_level,
    mobility_level: patientData.mobility_level,
    current_medications: patientData.current_medications,
    medical_history: patientData.medical_history,
    special_instructions: patientData.special_instructions,
    client_name: patientData.client_name,
    client_email: patientData.client_email,
    client_phone: patientData.client_phone,
    referring_vet: patientData.referring_vet
  }]).select('id');
  if (error) throw error;
  return { id: data[0].id };
}

async function deletePatient(id) {
  // Cascade: delete protocols first
  await supabase.from('protocols').delete().eq('patient_id', id);
  const { data, error } = await supabase.from('patients').delete().eq('id', id).select('id');
  if (error) throw error;
  return { changes: data.length };
}

async function deletePatientsById(ids) {
  const { data, error } = await supabase.from('patients').delete().in('id', ids).select('id');
  if (error) throw error;
  return { changes: data.length };
}

// ── Protocols ───────────────────────────────────────────────────────────────

async function createProtocol(patientId, protocolData) {
  const { error } = await supabase.from('protocols').insert([{
    patient_id: patientId,
    protocol_data: JSON.stringify(protocolData)
  }]);
  if (error) throw error;
}

async function deleteProtocolsByPatient(patientId) {
  const { error } = await supabase.from('protocols').delete().eq('patient_id', patientId);
  if (error) throw error;
}

// ── Conditions ──────────────────────────────────────────────────────────────

async function getAllConditions() {
  const { data, error } = await supabase.from('conditions').select('*').order('category').order('name');
  if (error) throw error;
  return data;
}

// ── Exercises (DB-stored, used by generateProtocol) ─────────────────────────

async function getAllExercisesFromDb() {
  const { data, error } = await supabase.from('exercises').select('*');
  if (error) throw error;
  return data;
}

// ── Health Check Counts ─────────────────────────────────────────────────────

async function getPatientCount() {
  const { data, error } = await supabase.rpc('get_patient_count');
  if (error) throw error;
  return data;
}

async function getProtocolCount() {
  const { data, error } = await supabase.rpc('get_protocol_count');
  if (error) throw error;
  return data;
}

// ── Audit Log ───────────────────────────────────────────────────────────────

async function insertAuditLog(entry) {
  const { error } = await supabase.from('audit_log').insert([{
    action: entry.action,
    resource_type: entry.resource_type || null,
    resource_id: entry.resource_id || null,
    user_label: entry.user_label || 'system',
    ip_address: entry.ip_address || null,
    request_method: entry.request_method || null,
    request_path: entry.request_path || null,
    status_code: entry.status_code || null,
    detail: entry.detail || null
  }]);
  if (error) throw error;
}

async function getAuditLog(limit = 200, offset = 0) {
  const { data, error, count } = await supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { rows: data, total: count || 0 };
}

async function getAuditLogStats() {
  const { data, error } = await supabase.rpc('get_audit_log_stats');
  if (error) throw error;
  return data;
}

async function getAuditLogExport() {
  const { data, error } = await supabase.from('audit_log').select('*').order('id', { ascending: false });
  if (error) throw error;
  return data;
}

async function purgeAuditLog(cutoffDate) {
  const { data, error } = await supabase.from('audit_log').delete().lt('timestamp', cutoffDate).select('id');
  if (error) throw error;
  return { changes: data.length };
}

// ── Users (auth) ────────────────────────────────────────────────────────────

async function getUserCount() {
  const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count;
}

async function findUserByUsername(username) {
  const { data, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
  if (error) throw error;
  return data;
}

async function findUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, display_name, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function createUser({ username, password_hash, role, display_name }) {
  const { data, error } = await supabase.from('users').insert([{
    username,
    password_hash,
    role: role || 'clinician',
    display_name: display_name || username
  }]).select('id, username, role');
  if (error) throw error;
  return data[0];
}

// ── Exercise Library v2 ─────────────────────────────────────────────────────

const exerciseLibrary = {
  getAllExercises: async (filters = {}) => {
    let query = supabase.from('exercises_v2').select(`
      id, name, domain, category,
      domains!inner(name),
      exercise_phases_v2(phase_id),
      exercise_tiers_v2(tier_id)
    `);

    if (filters.domain) query = query.eq('domain', filters.domain);
    if (filters.phase) query = query.in('id',
      supabase.from('exercise_phases_v2').select('exercise_id').eq('phase_id', parseInt(filters.phase))
    );
    if (filters.tier) query = query.in('id',
      supabase.from('exercise_tiers_v2').select('exercise_id').eq('tier_id', parseInt(filters.tier))
    );

    query = query.order('domain').order('id');
    const { data, error } = await query;
    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      name: row.name,
      domain: row.domain,
      category: row.category,
      domain_name: row.domains?.name || null,
      phases: (row.exercise_phases_v2 || []).map(p => p.phase_id),
      tiers: (row.exercise_tiers_v2 || []).map(t => t.tier_id)
    }));
  },

  getExerciseById: async (id) => {
    const { data, error } = await supabase.from('exercises_v2').select(`
      id, name, domain, category,
      domains!inner(name),
      exercise_phases_v2(phase_id),
      exercise_tiers_v2(tier_id)
    `).eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id, name: data.name, domain: data.domain, category: data.category,
      domain_name: data.domains?.name || null,
      phases: (data.exercise_phases_v2 || []).map(p => p.phase_id),
      tiers: (data.exercise_tiers_v2 || []).map(t => t.tier_id)
    };
  },

  getDomains: async () => {
    const { data, error } = await supabase.from('domains').select('*').order('id');
    if (error) throw error;
    return data;
  },

  getPhases: async () => {
    const { data, error } = await supabase.from('phases').select('*').order('id');
    if (error) throw error;
    return data;
  },

  getTiers: async () => {
    const { data, error } = await supabase.from('tiers').select('*').order('id');
    if (error) throw error;
    return data;
  },
};

// ── SQL-compatible wrappers (server.js compatibility) ──────────────────────
// server.js uses raw SQL via run/get/all. These shims allow Supabase provider
// to be used as a drop-in replacement. For production Supabase, these would
// need Supabase Edge Functions or direct postgrest queries.
async function run(sql, params = []) {
  console.warn("[Supabase] run() called with raw SQL — use direct Supabase client for production");
  return { lastID: 0, changes: 0 };
}

async function get(sql, params = []) {
  console.warn("[Supabase] get() called with raw SQL — use direct Supabase client for production");
  return null;
}

async function all(sql, params = []) {
  console.warn("[Supabase] all() called with raw SQL — use direct Supabase client for production");
  return [];
}

// ── Close ───────────────────────────────────────────────────────────────────

async function close() {
  // Supabase client doesn't need explicit closing
}

// ── Export ───────────────────────────────────────────────────────────────────

module.exports = {
  initialize,
  createTables,
  seedConditions,
  seedExercises,
  seedExerciseLibrary,
  close,

  // Patients
  getAllPatients,
  createPatient,
  deletePatient,
  deletePatientsById,

  // Protocols
  createProtocol,
  deleteProtocolsByPatient,

  // Conditions
  getAllConditions,

  // Exercises
  getAllExercisesFromDb,

  // Health
  getPatientCount,
  getProtocolCount,

  // Audit
  insertAuditLog,
  getAuditLog,
  getAuditLogStats,
  getAuditLogExport,
  purgeAuditLog,

  // Users
  getUserCount,
  findUserByUsername,
  findUserById,
  createUser,

  // Exercise Library v2
  exerciseLibrary,

  // SQL-compatible wrappers (for server.js compatibility)
  run,
  get,
  all,

  // V2 library seeding (no-op for Supabase — use seed-supabase.js)
  seedV2Library: seedExerciseLibrary,
};
