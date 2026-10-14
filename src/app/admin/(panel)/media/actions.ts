"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/auth";
import { done, fail, fdStr, type ActionState } from "@/lib/action-state";
import { deleteStoredImage } from "@/lib/image-storage";
import { revalidatePath } from "next/cache";

export async function deleteMedia(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requirePermission("media.manage");
  const id = Number(fd.get("id"));
  const [m] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!m) return fail("File nahi mili.");
  await deleteStoredImage(m.url);
  await db.delete(media).where(eq(media.id, id));
  await logActivity(user, "delete", "media", id, m.filename);
  revalidatePath("/admin/media");
  return done("Image delete ho gayi.");
}

export async function updateAlt(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("media.manage");
  await db.update(media).set({ alt: fdStr(fd, "alt").slice(0, 191) }).where(eq(media.id, Number(fd.get("id"))));
  return done("Alt text save ho gaya.");
}
