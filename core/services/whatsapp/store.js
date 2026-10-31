import fs from 'fs';
import path from 'path';
import { createStore } from 'zapo-js';
import { createSqliteStore } from '@zapo-js/store-sqlite';
import { createMysqlStore } from '@zapo-js/store-mysql';
import env from '@nakiri/core/services/env';
import { dirStorage } from '@nakiri/core/utils/path';

export function createWhatsAppStore() {
  const dbConnection = env.DB_CONNECTION || 'sqlite';

  if (dbConnection === 'mysql') {
    const backend = createMysqlStore({
      tablePrefix: 'zapo_',
      pool: {
        host: env.DB_HOST || '127.0.0.1',
        port: env.DB_PORT || 3306,
        user: env.DB_USER || 'root',
        password: env.DB_PASSWORD || '',
        database: env.DB_DATABASE || 'walazy_md',
        connectionLimit: 2,
      },
    });

    /** @type {import('zapo-js').WaStore} */
    const mysqlStore = /** @type {any} */ (createStore)({
      backends: { mysql: backend },
      providers: {
        auth: 'mysql',
        signal: 'mysql',
        preKey: 'mysql',
        session: 'mysql',
        identity: 'mysql',
        senderKey: 'mysql',
        appState: 'mysql',
        privacyToken: 'mysql',
        messages: env.STORE_ENABLED && env.STORE_MESSAGES ? 'mysql' : 'none',
        threads: env.STORE_ENABLED && env.STORE_CHATS ? 'mysql' : 'none',
        contacts: env.STORE_ENABLED && env.STORE_CONTACTS ? 'mysql' : 'none',
      },
    });

    return Object.assign(mysqlStore, {
      async getRegisteredSessions() {
        const mysql2 = await import('mysql2/promise');
        let conn;
        try {
          conn = await mysql2.default.createConnection({
            host: env.DB_HOST || '127.0.0.1',
            port: env.DB_PORT || 3306,
            user: env.DB_USER || 'root',
            password: env.DB_PASSWORD || '',
            database: env.DB_DATABASE || 'walazy_md',
          });
          const [rows] = await conn.query(
            `SELECT session_id as sessionId, me_jid as meJid FROM zapo_auth_credentials WHERE me_jid IS NOT NULL`
          );
          const sessionRows = Array.isArray(rows)
            ? /** @type {any[]} */ (rows)
            : [];
          return sessionRows.filter((r) => Boolean(r.sessionId && r.meJid));
        } catch {
          return [];
        } finally {
          if (conn) {
            await conn.end();
          }
        }
      },
    });
  }

  // Default: SQLite store
  const dbPath = dirStorage('zapo_auth.sqlite');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const backend = createSqliteStore({
    path: dbPath,
    driver: 'auto',
  });

  /** @type {import('zapo-js').WaStore} */
  const sqliteStore = /** @type {any} */ (createStore)({
    backends: { sqlite: backend },
    providers: {
      auth: 'sqlite',
      signal: 'sqlite',
      preKey: 'sqlite',
      session: 'sqlite',
      identity: 'sqlite',
      senderKey: 'sqlite',
      appState: 'sqlite',
      privacyToken: 'sqlite',
      messages: env.STORE_ENABLED && env.STORE_MESSAGES ? 'sqlite' : 'none',
      threads: env.STORE_ENABLED && env.STORE_CHATS ? 'sqlite' : 'none',
      contacts: env.STORE_ENABLED && env.STORE_CONTACTS ? 'sqlite' : 'none',
    },
  });

  return Object.assign(sqliteStore, {
    async getRegisteredSessions() {
      try {
        const Database = (await import('better-sqlite3')).default;
        if (!fs.existsSync(dbPath)) return [];
        const db = new Database(dbPath);
        try {
          /** @type {any[]} */
          const rows = db
            .prepare(
              `SELECT session_id as sessionId, me_jid as meJid FROM auth_credentials WHERE me_jid IS NOT NULL`
            )
            .all();
          return (rows || []).filter((r) => Boolean(r.sessionId && r.meJid));
        } finally {
          db.close();
        }
      } catch {
        return [];
      }
    },
  });
}

export default createWhatsAppStore;
