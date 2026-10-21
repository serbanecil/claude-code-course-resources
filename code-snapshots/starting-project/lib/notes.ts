import { randomBytes } from 'node:crypto';
import { get, query, run } from './db';

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string; // stringified TipTap doc
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

/** 128 bits of entropy, 22 URL-safe chars. */
function generateSlug(): string {
  return randomBytes(16).toString('base64url');
}

const EMPTY_DOC = JSON.stringify({ type: 'doc', content: [] });

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string; isPublic?: boolean },
): Note {
  const id = crypto.randomUUID();
  run(
    'INSERT INTO notes (id, user_id, title, content_json, is_public, public_slug) VALUES (?, ?, ?, ?, ?, ?)',
    [
      id,
      userId,
      data.title || 'Untitled note',
      data.contentJson ?? EMPTY_DOC,
      data.isPublic ? 1 : 0,
      data.isPublic ? generateSlug() : null,
    ],
  );
  const row = get<NoteRow>('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  if (!row) throw new Error('Failed to create note');
  return toNote(row);
}

/** Returns the note only if it belongs to `userId`; callers respond 404 on undefined. */
export function getNote(userId: string, id: string): Note | undefined {
  const row = get<NoteRow>('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return row && toNote(row);
}

export function listNotes(userId: string): Note[] {
  return query<NoteRow>('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [
    userId,
  ]).map(toNote);
}

/** Returns false if the note doesn't exist or isn't owned by `userId`. */
export function updateNote(
  userId: string,
  id: string,
  data: { title: string; contentJson: string; isPublic: boolean },
): boolean {
  // Keeps the existing slug while public (so the link stays stable); clears it when private.
  const result = run(
    `UPDATE notes SET title = ?, content_json = ?, is_public = ?,
       public_slug = CASE WHEN ? = 1 THEN COALESCE(public_slug, ?) ELSE NULL END
     WHERE id = ? AND user_id = ?`,
    [
      data.title || 'Untitled note',
      data.contentJson,
      data.isPublic ? 1 : 0,
      data.isPublic ? 1 : 0,
      generateSlug(),
      id,
      userId,
    ],
  );
  return result.changes > 0;
}

/** Looks up a publicly shared note by slug; no ownership check, so never expose `userId`. */
export function getPublicNote(
  slug: string,
): Pick<Note, 'title' | 'contentJson' | 'updatedAt'> | undefined {
  const row = get<NoteRow>('SELECT * FROM notes WHERE public_slug = ? AND is_public = 1', [slug]);
  return row && { title: row.title, contentJson: row.content_json, updatedAt: row.updated_at };
}

export function deleteNote(userId: string, id: string): boolean {
  const result = run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return result.changes > 0;
}
