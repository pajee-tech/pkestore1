"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, subscribers } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { done, type ActionState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";

export async function markRead(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("messages.view");
  const id = Number(fd.get("id"));
  const [m] = await db.select({ r: messages.isRead }).from(messages).where(eq(messages.id, id)).limit(1);
  await db.update(messages).set({ isRead: !m?.r }).where(eq(messages.id, id));
  revalidatePath("/admin", "layout");
  return done(m?.r ? "Unread mark ho gaya." : "Read mark ho gaya.");
}
export async function deleteMessage(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("messages.view");
  await db.delete(messages).where(eq(messages.id, Number(fd.get("id"))));
  revalidatePath("/admin", "layout");
  return done("Message delete ho gaya.");
}
export async function deleteSubscriber(_: ActionState, fd: FormData): Promise<ActionState> {
  await requirePermission("messages.view");
  await db.delete(subscribers).where(eq(subscribers.id, Number(fd.get("id"))));
  revalidatePath("/admin/messages");
  return done("Subscriber hata diya gaya.");
}
