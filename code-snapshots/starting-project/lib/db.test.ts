import { beforeEach, describe, expect, it } from 'vitest';
import { get, getDb, query, run } from './db';

beforeEach(() => {
  getDb();
  run('DELETE FROM user');
});

describe('db helpers', () => {
  it('getDb returns a singleton', () => {
    expect(getDb()).toBe(getDb());
  });

  it('creates the schema tables', () => {
    const names = query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table'",
    ).map((row) => row.name);
    expect(names).toEqual(
      expect.arrayContaining(['user', 'session', 'account', 'verification', 'notes']),
    );
  });

  it('run reports changes; query and get read rows', () => {
    const result = run('INSERT INTO user (id, name, email) VALUES (?, ?, ?)', [
      'u1',
      'U',
      'u@x.io',
    ]);
    expect(result.changes).toBe(1);
    expect(query<{ id: string }>('SELECT id FROM user')).toEqual([{ id: 'u1' }]);
    expect(get<{ id: string }>('SELECT id FROM user WHERE id = ?', ['u1'])).toEqual({ id: 'u1' });
  });

  it('get returns undefined (not null) when nothing matches', () => {
    expect(get('SELECT * FROM user WHERE id = ?', ['nope'])).toBeUndefined();
  });

  it('enforces foreign keys on notes.user_id', () => {
    expect(() =>
      run('INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)', [
        'n',
        'ghost',
        't',
        '{}',
      ]),
    ).toThrow();
  });
});
