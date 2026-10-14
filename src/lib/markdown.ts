import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      const id = inner.replace(/<[^>]+>/g, "").toLowerCase().replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
    },
  },
});

/** Markdown (ya simple HTML) ko safe HTML mein convert karta hai. Scripts / onclick waghera hata deta hai. */
export function renderContent(md: string | null | undefined): string {
  if (!md) return "";
  const html = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "iframe", "figure", "figcaption", "span", "mark"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "name", "target", "rel"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
      "*": ["id", "class"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "www.google.com"],
    transformTags: {
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
      a: (tagName, attribs) =>
        /^https?:/i.test(attribs.href || "")
          ? { tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }
          : { tagName, attribs },
    },
  });
}

export function extractHeadings(md: string | null | undefined) {
  if (!md) return [] as { id: string; text: string; level: number }[];
  const out: { id: string; text: string; level: number }[] = [];
  for (const line of md.split("\n")) {
    const m = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (m) {
      const text = m[2].replace(/[*_`]/g, "").trim();
      out.push({ id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), text, level: m[1].length });
    }
  }
  return out;
}
