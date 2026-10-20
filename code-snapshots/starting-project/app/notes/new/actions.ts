"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createNote } from "@/lib/notes";
import { getCurrentUserId } from "@/lib/session";

export type CreateNoteState = { error?: string; title?: string } | null;

const docSchema = z.object({ type: z.literal("doc") }).loose();

const formSchema = z.object({
  title: z.string().trim().max(200),
  content: z
    .string()
    .max(1_000_000)
    .transform((value, ctx) => {
      try {
        return docSchema.parse(JSON.parse(value));
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid note content" });
        return z.NEVER;
      }
    }),
});

export async function createNoteAction(
  _prev: CreateNoteState,
  formData: FormData,
): Promise<CreateNoteState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const title = String(formData.get("title") ?? "");
  const parsed = formSchema.safeParse({
    title,
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, title };
  }

  createNote(userId, {
    title: parsed.data.title,
    contentJson: JSON.stringify(parsed.data.content),
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
