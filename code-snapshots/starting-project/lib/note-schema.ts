import { getSchema } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";

/** Single source of truth for the editor and for server-side content validation. */
export const noteExtensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
];

const schema = getSchema(noteExtensions);

/** True if `json` is a structurally valid document for the note schema. */
export function isValidNoteDoc(json: unknown): boolean {
  try {
    const doc = Node.fromJSON(schema, json);
    doc.check();
    return doc.type.name === "doc";
  } catch {
    return false;
  }
}
