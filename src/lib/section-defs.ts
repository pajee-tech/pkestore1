import type { SectionType } from "@/db/schema";

export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "image" | "link" | "markdown"; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "number"; hint?: string; min?: number; max?: number }
  | { key: string; label: string; type: "checkbox"; hint?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; hint?: string }
  | { key: string; label: string; type: "icon"; hint?: string }
  | { key: string; label: string; type: "category"; hint?: string };

export type SectionDef = {
  label: string;
  description: string;
  title: boolean;
  subtitle: boolean;
  fields: FieldDef[];
  items?: { key: string; label: string; fields: FieldDef[]; max: number };
  defaults: Record<string, unknown>;
};

export const SECTION_DEFS: Record<SectionType, SectionDef> = {
  hero: {
    label: "Hero slider",
    description: "Page ke top pe bari slides. Image 1600×800 behtar hai (products right side pe).",
    title: false,
    subtitle: false,
    fields: [],
    items: {
      key: "slides",
      label: "Slide",
      max: 6,
      fields: [
        { key: "image", label: "Image", type: "image" },
        { key: "title", label: "Heading", type: "text" },
        { key: "subtitle", label: "Text", type: "textarea" },
        { key: "buttonText", label: "Button text", type: "text" },
        { key: "buttonLink", label: "Button link", type: "link", hint: "e.g. /category/smart-gadgets" },
      ],
    },
    defaults: { slides: [{ image: "", title: "", subtitle: "", buttonText: "Shop now", buttonLink: "/shop" }] },
  },
  usp: {
    label: "Trust badges (USP bar)",
    description: "Free delivery, COD waghera ki chhoti strip.",
    title: false,
    subtitle: false,
    fields: [],
    items: { key: "items", label: "Badge", max: 4, fields: [{ key: "icon", label: "Icon", type: "icon" }, { key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "text" }] },
    defaults: { items: [{ icon: "Truck", title: "Free delivery", text: "" }] },
  },
  categories: { label: "Category circles", description: "Tamam main categories image ke sath.", title: true, subtitle: true, fields: [], defaults: {} },
  products: {
    label: "Product row / grid",
    description: "Products ki list: featured, best selling, new, sale ya kisi category ke.",
    title: true,
    subtitle: true,
    fields: [
      {
        key: "source",
        label: "Products source",
        type: "select",
        options: [
          { value: "featured", label: "Featured products" },
          { value: "popular", label: "Best selling" },
          { value: "latest", label: "Newest" },
          { value: "sale", label: "Biggest discounts" },
          { value: "category", label: "From a category" },
        ],
      },
      { key: "categoryId", label: "Category (agar source = category)", type: "category" },
      { key: "limit", label: "How many", type: "number", min: 2, max: 24 },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "row", label: "Scrolling row" }] },
      { key: "viewAllLink", label: "\"View all\" link", type: "link" },
    ],
    defaults: { source: "featured", limit: 8, layout: "grid", viewAllLink: "/shop" },
  },
  banner: {
    label: "Wide banner",
    description: "Ek bara promotional banner. Title/subtitle banner pe likha aata hai.",
    title: true,
    subtitle: true,
    fields: [
      { key: "image", label: "Image (1600×600)", type: "image" },
      { key: "buttonText", label: "Button text", type: "text" },
      { key: "buttonLink", label: "Link", type: "link" },
      { key: "dark", label: "Dark image (white text)", type: "checkbox" },
    ],
    defaults: { image: "", buttonText: "Shop now", buttonLink: "/shop" },
  },
  dual_banner: {
    label: "Two banners",
    description: "Do banners saath saath (mobile pe upar neeche).",
    title: false,
    subtitle: false,
    fields: [],
    items: {
      key: "items",
      label: "Banner",
      max: 2,
      fields: [
        { key: "image", label: "Image (1200×600)", type: "image" },
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Text", type: "text" },
        { key: "buttonText", label: "Button text", type: "text" },
        { key: "buttonLink", label: "Link", type: "link" },
        { key: "dark", label: "Dark image (white text)", type: "checkbox" },
      ],
    },
    defaults: { items: [{ image: "", title: "", text: "", buttonText: "Shop", buttonLink: "/shop" }] },
  },
  testimonials: {
    label: "Customer reviews",
    description: "Customers ki raaye.",
    title: true,
    subtitle: true,
    fields: [],
    items: { key: "items", label: "Review", max: 9, fields: [{ key: "name", label: "Name", type: "text" }, { key: "city", label: "City", type: "text" }, { key: "rating", label: "Stars (1–5)", type: "number", min: 1, max: 5 }, { key: "text", label: "Review", type: "textarea" }] },
    defaults: { items: [{ name: "", city: "", rating: 5, text: "" }] },
  },
  guides: { label: "Latest guides", description: "Naye pillar/cluster articles.", title: true, subtitle: true, fields: [{ key: "limit", label: "How many", type: "number", min: 1, max: 9 }], defaults: { limit: 3 } },
  newsletter: { label: "Newsletter signup", description: "Email subscribe box.", title: true, subtitle: true, fields: [], defaults: {} },
  richtext: { label: "Text block", description: "Apna text, headings, links (SEO text ke liye bhi).", title: true, subtitle: false, fields: [{ key: "content", label: "Content", type: "markdown" }], defaults: { content: "" } },
};
