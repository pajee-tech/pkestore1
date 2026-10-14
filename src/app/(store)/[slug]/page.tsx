import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getPage, getSettings } from "@/lib/data";
import { renderContent } from "@/lib/markdown";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ContactForm } from "@/components/store/contact-form";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPage("PAGE", (await params).slug);
  if (!p) return {};
  return { title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt || undefined, alternates: { canonical: `/${p.slug}` } };
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const [page, s] = await Promise.all([getPage("PAGE", slug), getSettings()]);
  if (!page) notFound();
  const isContact = slug === "contact" || slug === "contact-us";
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: page.title }]} />
      <div className={isContact ? "grid gap-8 lg:grid-cols-[1fr_1.1fr]" : "mx-auto max-w-3xl"}>
        <div>
          <h1 className="text-3xl font-extrabold sm:text-5xl">{page.title}</h1>
          {page.excerpt && <p className="mt-3 text-lg text-muted">{page.excerpt}</p>}
          <div className="prose-store mt-4" dangerouslySetInnerHTML={{ __html: renderContent(page.content) }} />
          {isContact && (
            <ul className="mt-6 space-y-3 text-[15px]">
              <li className="flex gap-3"><Phone className="size-5 text-brand-700" /><a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a></li>
              <li className="flex gap-3"><Mail className="size-5 text-brand-700" /><a href={`mailto:${s.email}`}>{s.email}</a></li>
              <li className="flex gap-3"><MapPin className="size-5 text-brand-700" />{s.address}</li>
              <li className="flex gap-3"><Clock className="size-5 text-brand-700" />{s.businessHours}</li>
            </ul>
          )}
        </div>
        {isContact && (
          <div className="h-fit rounded-[24px] border border-line bg-white p-6 sm:p-8">
            <h2 className="mb-5 text-xl font-bold">Send us a message</h2>
            <ContactForm />
          </div>
        )}
      </div>
    </div>
  );
}
