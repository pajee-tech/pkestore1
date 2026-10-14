/**
 * Apne computer pe images ko WebP (≤200KB, max 1600px) mein convert karein — upload se pehle.
 * Usage: npm run images -- "C:\Users\me\Pictures\products"
 * Output: usi folder ke andar "webp" folder.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function main() {
  const dir = process.argv[2];
  if (!dir || !fs.existsSync(dir)) {
    console.log('Usage: npm run images -- "folder/path"');
    process.exit(1);
  }
  const out = path.join(dir, "webp");
  fs.mkdirSync(out, { recursive: true });
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
  for (const f of files) {
    const input = fs.readFileSync(path.join(dir, f));
    let width = 1600;
    let quality = 82;
    let buf = Buffer.alloc(0);
    for (let i = 0; i < 12; i++) {
      buf = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality, effort: 5 }).toBuffer();
      if (buf.length <= 200 * 1024) break;
      if (quality > 55) quality -= 8;
      else width = Math.round(width * 0.85);
    }
    const name = f.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".webp";
    fs.writeFileSync(path.join(out, name), buf);
    console.log(`✓ ${f} → webp/${name} (${Math.round(buf.length / 1024)} KB)`);
  }
  console.log(`\n${files.length} images convert ho gayin: ${out}`);
}
main();
