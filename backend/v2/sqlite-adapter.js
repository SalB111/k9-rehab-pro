/**
 * Minimal promise wrapper around a node-sqlite3 Database.
 *
 * Exposes the same run/get/all shape the existing K9 providers already use, so
 * protocol-store.js stays database-agnostic and can be pointed at the real
 * provider (SQLite or Supabase) without change.
 *
 * `run` resolves to { lastID, changes } — protocol-store depends on lastID for
 * insert ids.
 */

'use strict';

function wrap(database) {
  return {
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.run(sql, params, function onDone(err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },

    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
      });
    },

    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
      });
    },

    close() {
      return new Promise((resolve, reject) => {
        database.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}

module.exports = { wrap };
