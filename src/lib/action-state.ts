export type ActionState = { ok: boolean; message: string; ts?: number } | null;

export function fail(message: string): ActionState {
  return { ok: false, message, ts: Date.now() };
}
export function done(message: string): ActionState {
  return { ok: true, message, ts: Date.now() };
}

/** FormData helpers */
export const fdStr = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export const fdNum = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : Number(v);
};
export const fdBool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true" || fd.get(k) === "1";
export function fdJson<T>(fd: FormData, k: string, fallback: T): T {
  try {
    const v = fd.get(k);
    return v ? (JSON.parse(String(v)) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Delete ke baad list page pe wapis bhejne ke liye (sirf /admin paths allowed) */
export function redirectTarget(fd: FormData): string | null {
  const to = String(fd.get("redirectTo") || "");
  return to.startsWith("/admin") && !to.startsWith("//") ? to : null;
}
