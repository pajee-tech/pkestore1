import Image from "next/image";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, Empty, PageHeader, Pagination } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { Uploader } from "./uploader";
import { CopyButton } from "./copy-button";
import { deleteMedia } from "./actions";

export const metadata = { title: "Media library" };
const PER = 48;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePagePermission("media.manage");
  const page = Math.max(Number((await searchParams).page) || 1, 1);
  const [rows, [{ n, total }]] = await Promise.all([
    db.select().from(media).orderBy(desc(media.id)).limit(PER).offset((page - 1) * PER),
    db.select({ n: sql<number>`count(*)`, total: sql<number>`coalesce(sum(${media.size}),0)` }).from(media),
  ]);
  return (
    <>
      <PageHeader title="Media library" description={`${n} images, total ${(Number(total) / 1024 / 1024).toFixed(1)} MB. Yahan upload ki gayi images products, banners aur articles mein istemal ho sakti hain.`} />
      <Card className="mb-6"><Uploader /></Card>
      {rows.length === 0 ? (
        <Empty title="Abhi koi upload nahi" text="Starter product images website ke saath aati hain (/seed folder). Nayi images yahan aayengi." />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {rows.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <a href={m.url} target="_blank" className="relative block aspect-square bg-paper"><Image src={m.url} alt={m.alt || ""} fill sizes="200px" className="object-cover" /></a>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium" title={m.filename}>{m.filename}</p>
                <p className="text-[11px] text-muted">{Math.round(m.size / 1024)} KB, {m.width}×{m.height}, {formatDate(m.createdAt)}</p>
                <div className="mt-1 flex justify-end">
                  <CopyButton text={m.url} />
                  <DeleteButton action={deleteMedia} id={m.id} confirmText="Image delete karein? Agar ye kisi product ya banner mein lagi hai to wahan nazar aana band ho jayegi." />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pages={Math.ceil(Number(n) / PER)} base="/admin/media" />
    </>
  );
}
