import { Database } from "bun:sqlite";
import path from "node:path";

type Param = string | number | bigint | null | Uint8Array;

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "app.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    idToken TEXT,
    password TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_json TEXT NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 0,
    public_slug TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);
  CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);

  -- Keep updated_at fresh on any update that doesn't set it explicitly.
  CREATE TRIGGER IF NOT EXISTS trg_notes_updated_at
  AFTER UPDATE ON notes
  WHEN NEW.updated_at = OLD.updated_at
  BEGIN
    UPDATE notes SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
  END;

  -- One-time fix: legacy rows used 'YYYY-MM-DD HH:MM:SS' (UTC, no zone marker).
  UPDATE notes SET created_at = replace(created_at, ' ', 'T') || 'Z'
    WHERE created_at NOT LIKE '%Z';
  UPDATE notes SET updated_at = replace(updated_at, ' ', 'T') || 'Z'
    WHERE updated_at NOT LIKE '%Z';
`;

let instance: Database | undefined;

export function getDb(): Database {
  if (!instance) {
    const db = new Database(DB_PATH, { create: true });
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA synchronous = NORMAL;");
    db.run("PRAGMA foreign_keys = ON;");
    db.exec(SCHEMA);
    instance = db;
  }
  return instance;
}

export function query<T>(sql: string, params: Param[] = []): T[] {
  return getDb().query(sql).all(...params) as T[];
}

export function get<T>(sql: string, params: Param[] = []): T | undefined {
  return (getDb().query(sql).get(...params) as T | null) ?? undefined;
}

export function run(sql: string, params: Param[] = []) {
  return getDb().run(sql, params);
}
