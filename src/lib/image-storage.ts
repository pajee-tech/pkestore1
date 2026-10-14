import "server-only";
import sharp from "sharp";
import crypto from "node:crypto";
import path from "node:path";
import { promises as fs } from "node:fs";
import { slugify } from "./utils";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel limit ~4.5MB
const TARGET_MAX = 200 * 1024; // 200KB
const ALLOWED = new Set(["jpeg", "png", "webp", "gif", "avif", "tiff", "heif"]);

export type OptimizedImage = { buffer: Buffer; width: number; height: number; size: number };

/**
 * Kisi bhi image ko WebP mein convert karta hai, max 1600px,
 * aur quality kam karta jata hai jab tak size 200KB se kam na ho jaye.
 */
export async function optimizeToWebp(input: Buffer, maxWidth = 1600): Promise<OptimizedImage> {
  const meta = await sharp(input, { failOn: "error" }).metadata();
  if (!meta.format || !ALLOWED.has(meta.format)) throw new Error("Sirf JPG, PNG, WebP, AVIF ya GIF images allowed hain.");
  let width = Math.min(meta.width || maxWidth, maxWidth);
  let quality = 82;
  for (let i = 0; i < 12; i++) {
    const out = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality, effort: 5 }).toBuffer({ resolveWithObject: true });
    if (out.data.length <= TARGET_MAX || (quality <= 45 && width <= 800)) {
      return { buffer: out.data, width: out.info.width, height: out.info.height, size: out.data.length };
    }
    if (quality > 55) quality -= 8;
    else width = Math.round(width * 0.85);
  }
  throw new Error("Image optimize nahi ho saki.");
}

/** Local uploads folder (Hostinger). Deploy folder se bahar rakhein taake redeploy pe images delete na hon. */
export function uploadDir() {
  return process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), "uploads");
}

/** Optimized image ko Vercel Blob (agar token ho) ya public/uploads mein save karta hai. */
export async function storeImage(buf: Buffer, originalName: string, folder = "uploads"): Promise<string> {
  const base = slugify(originalName.replace(/\.[a-z0-9]+$/i, "")) || "image";
  const name = `${base}-${crypto.randomBytes(8).toString("hex")}.webp`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const res = await put(`${folder}/${name}`, buf, { access: "public", contentType: "image/webp", addRandomSuffix: false });
    return res.url;
  }
  const sub = folder === "uploads" ? "" : folder;
  const dir = path.join(uploadDir(), sub);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${sub ? sub + "/" : ""}${name}`;
}

export async function deleteStoredImage(url: string) {
  try {
    if (url.includes("blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(url);
    } else if (url.startsWith("/uploads/")) {
      const p = path.join(uploadDir(), url.slice("/uploads/".length));
      if (p.startsWith(uploadDir() + path.sep)) await fs.unlink(p);
    }
  } catch {
    /* ignore */
  }
}
