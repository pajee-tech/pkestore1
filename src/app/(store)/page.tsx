import { getHomeSections, getSettings } from "@/lib/data";
import { RenderSection } from "@/components/store/sections";
import { siteUrl } from "@/lib/utils";

export default async function HomePage() {
  const [sections, s] = await Promise.all([getHomeSections(), getSettings()]);
  const ld = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: s.siteName,
    url: siteUrl(),
    telephone: s.phone,
    email: s.email,
    address: { "@type": "PostalAddress", addressLocality: s.address, addressCountry: "PK" },
    potentialAction: { "@type": "SearchAction", target: siteUrl("/search?q={q}"), "query-input": "required name=q" },
  };
  return (
    <>
      <h1 className="sr-only">{s.seoTitle}</h1>
      {sections.map((sec) => (
        <RenderSection key={sec.id} s={sec} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
