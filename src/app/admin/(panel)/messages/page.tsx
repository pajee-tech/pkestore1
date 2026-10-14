import Link from "next/link";
import { desc } from "drizzle-orm";
import { MailOpen, Mail, MessageCircle, Download } from "lucide-react";
import { db } from "@/db";
import { messages, subscribers } from "@/db/schema";
import { requirePagePermission } from "@/lib/auth";
import { formatDate, normalizePhone } from "@/lib/utils";
import { Badge, Empty, PageHeader, Table } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActionButton } from "@/components/admin/action-button";
import { deleteMessage, deleteSubscriber, markRead } from "./actions";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requirePagePermission("messages.view");
  const tab = (await searchParams).tab === "subscribers" ? "subscribers" : "messages";
  const [msgs, subs] = await Promise.all([
    tab === "messages" ? db.select().from(messages).orderBy(desc(messages.id)).limit(200) : [],
    tab === "subscribers" ? db.select().from(subscribers).orderBy(desc(subscribers.id)).limit(1000) : [],
  ]);
  return (
    <>
      <PageHeader title="Messages" description="Contact form ke messages aur newsletter subscribers." actions={tab === "subscribers" ? <a href="/api/admin/subscribers-export" className="btn-outline"><Download className="size-4" /> Export CSV</a> : undefined} />
      <div className="mb-4 flex gap-2">
        <Link href="/admin/messages" className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "messages" ? "bg-brand-700 text-white" : "bg-white ring-1 ring-line"}`}>Contact messages</Link>
        <Link href="/admin/messages?tab=subscribers" className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "subscribers" ? "bg-brand-700 text-white" : "bg-white ring-1 ring-line"}`}>Subscribers</Link>
      </div>
      {tab === "messages" ? (
        msgs.length === 0 ? <Empty title="Koi message nahi" /> : (
          <ul className="space-y-3">
            {msgs.map((m) => (
              <li key={m.id} className={`rounded-2xl border bg-white p-5 ${m.isRead ? "border-line" : "border-brand-200 ring-2 ring-brand-50"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <b>{m.name}</b>
                  {!m.isRead && <Badge className="bg-brand-50 text-brand-800">New</Badge>}
                  <span className="text-sm text-muted">{[m.phone, m.email].filter(Boolean).join(", ")}</span>
                  <span className="ml-auto text-xs text-muted">{formatDate(m.createdAt, true)}</span>
                </div>
                {m.subject && <p className="mt-2 font-medium">{m.subject}</p>}
                <p className="mt-1 whitespace-pre-line text-[15px]">{m.message}</p>
                <div className="mt-3 flex items-center gap-1">
                  {m.phone && <a href={`https://wa.me/92${normalizePhone(m.phone).replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"><MessageCircle className="size-4" /> WhatsApp</a>}
                  {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"><Mail className="size-4" /> Email</a>}
                  <ActionButton action={markRead} id={m.id} title={m.isRead ? "Mark unread" : "Mark read"}><MailOpen className="size-4" /></ActionButton>
                  <DeleteButton action={deleteMessage} id={m.id} />
                </div>
              </li>
            ))}
          </ul>
        )
      ) : subs.length === 0 ? <Empty title="Abhi koi subscriber nahi" /> : (
        <Table head={["Email", "Subscribed", ""]}>
          {subs.map((s) => (
            <tr key={s.id}><td className="px-4 py-2.5">{s.email}</td><td className="px-4 py-2.5 text-muted">{formatDate(s.createdAt)}</td><td className="px-4 py-2.5 text-right"><DeleteButton action={deleteSubscriber} id={s.id} /></td></tr>
          ))}
        </Table>
      )}
    </>
  );
}
