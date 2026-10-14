import "server-only";
import { updateTag } from "next/cache";
import { TAGS } from "./cache-tags";

/** Admin ke change ke baad website ka cache foran update karta hai. Sirf server actions mein call karein. */
export function refresh(...tags: (keyof typeof TAGS)[]) {
  for (const t of tags) updateTag(TAGS[t]);
}
