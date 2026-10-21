"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { NoteFormState } from "@/app/notes/new/actions";
import { noteFormSchema } from "@/lib/note-form-schema";
import { deleteNote, updateNote } from "@/lib/notes";
import { getCurrentUserId } from "@/lib/session";

export async function updateNoteAction(
  id: string,
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const title = String(formData.get("title") ?? "");
  const parsed = noteFormSchema.safeParse({
    title,
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, title };
  }

  const updated = updateNote(userId, id, {
    title: parsed.data.title,
    contentJson: JSON.stringify(parsed.data.content),
  });
  if (!updated) notFound();

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${id}`);
  redirect(`/notes/${id}`);
}

export async function deleteNoteAction(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");
  if (!deleteNote(userId, id)) notFound();

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
