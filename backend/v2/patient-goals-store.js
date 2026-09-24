/**
 * K9 Clinical Workflow V2 — Patient Goals store
 *
 * V3. `patient_goals` and `patient_goal_items` are the SOURCE OF TRUTH for the
 * goals block. `patients.dashboard_data` is no longer read for it.
 *
 * WHAT CHANGED BEYOND MOVING THE DATA
 *
 * V1 kept goals as four boxes of free text. That records what somebody wrote;
 * it does not make a rehabilitation workflow. A goal here is an ITEM with a
 * horizon, a kind, a target date and a review status, so the question a
 * clinician actually asks at reassessment — "which goals are due, and which has
 * nobody looked at?" — is answerable.
 *
 * THREE RULES THIS MODULE ENFORCES
 *
 *   1. A NULL status means UNREVIEWED, never "in progress". The count of
 *      unreviewed goals is the point of the exercise.
 *   2. `target_date` is set by a clinician and NEVER parsed from the goal text.
 *      See goals.js — a pattern for "within N units" read a 1 cm tolerance and
 *      a 12-inch jump height as deadlines on the real records.
 *   3. `overdue` is computed on read, never stored. A stored flag is wrong the
 *      day after it is written.
 *
 * Goals are not deleted. A goal that no longer applies is DISCONTINUED, which
 * keeps the record of what was once being worked toward.
 */

'use strict';

const { ProtocolStoreError, ERR } = require('./protocol-store');
const goals = require('./goals');

const SET_TABLE = 'patient_goals';
const ITEM_TABLE = 'patient_goal_items';

/** The goal-SET columns, derived from the fields that are not trackable items. */
const SET_COLUMNS = goals.FIELDS.filter((f) => !f.item).map((f) => f.key);

/** Fields that migrate into `patient_goal_items`, one item each. */
const ITEM_FIELDS = goals.FIELDS.filter((f) => f.item);

function blank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Fail loudly if the tables and the field list disagree.
 *
 * A set field with no column would be accepted by the API and silently dropped
 * — the clinician answers, and the answer is gone.
 */
async function assertSchema(db) {
  for (const [table, expected] of [[SET_TABLE, SET_COLUMNS], [ITEM_TABLE, ['goal_text', 'horizon', 'kind', 'status', 'target_date']]]) {
    const rows = await db.all(`PRAGMA table_info(${table})`);
    if (!rows || !rows.length) {
      throw new Error(
        `[patient-goals-store] ${table} does not exist. Apply `
        + `v2/schema/patient-goals.sqlite.sql (it is in schema.js SQLITE_SCHEMAS).`
      );
    }
    const present = new Set(rows.map((r) => r.name));
    const missing = expected.filter((c) => !present.has(c));
    if (missing.length) {
      throw new Error(
        `[patient-goals-store] goals.js expects columns ${table} does not have: `
        + `${missing.join(', ')}. A clinician's answer to those would be accepted and discarded.`
      );
    }
  }
  return true;
}

/** Shape one stored row into the form callers and the screen read. */
function shapeItem(row, asOf) {
  return {
    id: row.id,
    horizon: row.horizon,
    kind: row.kind,
    goal_text: row.goal_text,
    source_field: row.source_field,
    target_date: row.target_date,
    status: row.status,
    status_note: row.status_note,
    reviewed_at: row.reviewed_at,
    reviewed_by: row.reviewed_by,
    reviewed_visit_id: row.reviewed_visit_id,
    // Derived, never stored.
    overdue: goals.isOverdue(row.target_date, row.status, asOf),
    reviewed: row.status !== null && row.status !== undefined,
    // Only a prompt. The text mentions a period but no date was set, so the
    // screen can ask — it never fills one in.
    mentions_timeframe_without_target:
      !row.target_date && goals.mentionsTimeframe(row.goal_text),
  };
}

/**
 * Everything about a patient's goals.
 *
 * `review` is the workflow summary: what a clinician needs before a
 * reassessment without reading every line.
 */
async function getGoals(db, patientId, { asOf } = {}) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);

  const setRow = await db.get(`SELECT * FROM ${SET_TABLE} WHERE patient_id = ?`, [patientId]);
  const itemRows = await db.all(
    `SELECT * FROM ${ITEM_TABLE} WHERE patient_id = ?
      ORDER BY CASE horizon WHEN 'SHORT' THEN 0 ELSE 1 END, sort_index, id`,
    [patientId]
  );

  const set = {};
  for (const key of SET_COLUMNS) {
    if (setRow && !blank(setRow[key])) set[key] = String(setRow[key]).trim();
  }

  const primaryGoals = goals.interpretPrimaryGoals(set.primary_goals);
  const uninterpreted = primaryGoals
    .filter((g) => g.code === null)
    .map((g) => ({ field: 'primary_goals', label: 'Primary rehabilitation goals', stated: g.stated }));

  const items = itemRows.map((r) => shapeItem(r, asOf));

  return {
    patient_id: patientId,
    set,
    primary_goals: primaryGoals,
    items,
    uninterpreted,
    /**
     * The reassessment summary. `unreviewed` is first on purpose: a goal
     * nobody has looked at is the failure this block was restructured to
     * surface, and it is invisible in four boxes of text.
     */
    review: {
      total: items.length,
      unreviewed: items.filter((i) => !i.reviewed).length,
      overdue: items.filter((i) => i.overdue === true).length,
      met: items.filter((i) => i.status === goals.GOAL_STATUS.MET).length,
      no_target_date: items.filter((i) => !i.target_date).length,
      needs_a_target_date: items.filter((i) => i.mentions_timeframe_without_target).length,
    },
    // Served so the screen holds no copy of the vocabulary.
    vocabulary: {
      horizons: Object.values(goals.HORIZON),
      kinds: Object.values(goals.GOAL_KIND),
      statuses: goals.GOAL_STATUSES,
      primaryGoalOptions: Object.keys(goals.PRIMARY_GOAL_CODES),
      setFields: goals.FIELDS.filter((f) => !f.item)
        .map((f) => ({ key: f.key, label: f.label, multi: Boolean(f.multi) })),
    },
    configured: Boolean(setRow) || items.length > 0,
    updated_at: setRow ? setRow.updated_at : null,
    updated_by: setRow ? setRow.updated_by : null,
  };
}

/** Upsert the goal SET. Only what is mentioned changes. */
async function setGoalSet(db, { patientId, set, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const input = set || {};
  const unknown = Object.keys(input).filter((k) => !SET_COLUMNS.includes(k));
  if (unknown.length) {
    throw new ProtocolStoreError(
      `Unknown goal fields: ${unknown.join(', ')}. Trackable goals are ITEMS — use addGoalItem.`,
      ERR.INVALID
    );
  }

  const existing = await db.get(`SELECT * FROM ${SET_TABLE} WHERE patient_id = ?`, [patientId]);
  const merged = {};
  for (const key of SET_COLUMNS) {
    merged[key] = key in input
      ? (blank(input[key]) ? null : String(input[key]).trim())
      : (existing ? existing[key] : null);
  }
  const values = SET_COLUMNS.map((k) => merged[k]);

  if (existing) {
    await db.run(
      `UPDATE ${SET_TABLE} SET ${SET_COLUMNS.map((k) => `${k} = ?`).join(', ')},
              updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?`,
      [...values, actor.id, patientId]
    );
  } else {
    await db.run(
      `INSERT INTO ${SET_TABLE} (patient_id, ${SET_COLUMNS.join(', ')}, updated_by)
       VALUES (?, ${SET_COLUMNS.map(() => '?').join(', ')}, ?)`,
      [patientId, ...values, actor.id]
    );
  }
  return getGoals(db, patientId);
}

function validateHorizonKind(horizon, kind) {
  if (!Object.values(goals.HORIZON).includes(horizon)) {
    throw new ProtocolStoreError(
      `horizon must be one of ${Object.values(goals.HORIZON).join(', ')} — got ${JSON.stringify(horizon)}`,
      ERR.INVALID
    );
  }
  if (!Object.values(goals.GOAL_KIND).includes(kind)) {
    throw new ProtocolStoreError(
      `kind must be one of ${Object.values(goals.GOAL_KIND).join(', ')} — got ${JSON.stringify(kind)}`,
      ERR.INVALID
    );
  }
}

/** Add a trackable goal. `targetDate` is optional and never inferred. */
async function addGoalItem(db, { patientId, horizon, kind, goalText, targetDate, sourceField, sortIndex, actor }) {
  if (!patientId) throw new ProtocolStoreError('patientId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);
  if (blank(goalText)) throw new ProtocolStoreError('A goal needs text', ERR.INVALID);
  validateHorizonKind(horizon, kind);

  const result = await db.run(
    `INSERT INTO ${ITEM_TABLE}
       (patient_id, horizon, kind, goal_text, source_field, target_date, sort_index, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [patientId, horizon, kind, String(goalText).trim(),
      sourceField || null, blank(targetDate) ? null : String(targetDate).slice(0, 10),
      Number.isFinite(sortIndex) ? sortIndex : 0, actor.id]
  );
  return result && result.lastID;
}

/** Change a goal's wording or its target date. Status is changed by review. */
async function updateGoalItem(db, { itemId, goalText, targetDate, sortIndex, actor }) {
  if (!itemId) throw new ProtocolStoreError('itemId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const row = await db.get(`SELECT * FROM ${ITEM_TABLE} WHERE id = ?`, [itemId]);
  if (!row) throw new ProtocolStoreError(`Goal ${itemId} not found`, ERR.NOT_FOUND);

  const text = goalText === undefined ? row.goal_text : String(goalText).trim();
  if (blank(text)) throw new ProtocolStoreError('A goal needs text', ERR.INVALID);
  const target = targetDate === undefined
    ? row.target_date
    : (blank(targetDate) ? null : String(targetDate).slice(0, 10));

  await db.run(
    `UPDATE ${ITEM_TABLE} SET goal_text = ?, target_date = ?, sort_index = ?,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [text, target, Number.isFinite(sortIndex) ? sortIndex : row.sort_index, itemId]
  );
  return db.get(`SELECT * FROM ${ITEM_TABLE} WHERE id = ?`, [itemId]);
}

/**
 * Review a goal — the workflow action this block was restructured for.
 *
 * `status` must be one of the five outcomes. Passing null CLEARS the review,
 * returning the goal to unreviewed, which is a legitimate correction of a
 * status set in error — and it clears who and when along with it, so the
 * record never shows a reviewer against no review.
 */
async function reviewGoalItem(db, { itemId, status, note, visitId, actor, at }) {
  if (!itemId) throw new ProtocolStoreError('itemId is required', ERR.INVALID);
  if (!actor || !actor.id) throw new ProtocolStoreError('An identified actor is required', ERR.INVALID);

  const row = await db.get(`SELECT * FROM ${ITEM_TABLE} WHERE id = ?`, [itemId]);
  if (!row) throw new ProtocolStoreError(`Goal ${itemId} not found`, ERR.NOT_FOUND);

  if (status !== null && status !== undefined && !goals.GOAL_STATUSES.includes(status)) {
    throw new ProtocolStoreError(
      `status must be one of ${goals.GOAL_STATUSES.join(', ')}, or null to clear the review — `
      + `got ${JSON.stringify(status)}`,
      ERR.INVALID
    );
  }

  const clearing = status === null || status === undefined;
  await db.run(
    `UPDATE ${ITEM_TABLE}
        SET status = ?, status_note = ?, reviewed_at = ?, reviewed_by = ?, reviewed_visit_id = ?,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [
      clearing ? null : status,
      clearing ? null : (blank(note) ? null : String(note).trim()),
      clearing ? null : (at || new Date().toISOString()),
      clearing ? null : actor.id,
      clearing ? null : (visitId || null),
      itemId,
    ]
  );
  return db.get(`SELECT * FROM ${ITEM_TABLE} WHERE id = ?`, [itemId]);
}

/**
 * The shape the HEP payload carries, from the TABLES.
 *
 * Split by audience the way it always was — but now the goals travel with
 * their status, so B.E.A.U. can show an owner what has already been achieved
 * rather than an undifferentiated list.
 *
 * `communication_preference` is practice admin and is deliberately excluded.
 */
async function toHepPayload(db, patientId, { asOf } = {}) {
  const record = await getGoals(db, patientId, { asOf });
  if (!record.configured) return null;

  const forAudience = (kinds) => record.items
    .filter((i) => kinds.includes(i.kind))
    .map((i) => ({
      goal: i.goal_text,
      horizon: i.horizon,
      target_date: i.target_date,
      status: i.status,
      overdue: i.overdue,
    }));

  return {
    primary_goals: record.primary_goals,
    owner_facing: {
      ...(record.set.owner_priority ? { owner_priority: record.set.owner_priority } : {}),
      ...(record.set.owner_expectations ? { owner_expectations: record.set.owner_expectations } : {}),
      goals: forAudience([goals.GOAL_KIND.FUNCTIONAL, goals.GOAL_KIND.OWNER]),
    },
    clinical: { goals: forAudience([goals.GOAL_KIND.CLINICAL]) },
    uninterpreted: record.uninterpreted,
    recorded_at: record.updated_at,
    recorded_by: record.updated_by,
  };
}

module.exports = {
  SET_TABLE,
  ITEM_TABLE,
  SET_COLUMNS,
  ITEM_FIELDS,
  assertSchema,
  getGoals,
  setGoalSet,
  addGoalItem,
  updateGoalItem,
  reviewGoalItem,
  toHepPayload,
};
