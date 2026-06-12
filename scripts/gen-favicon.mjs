import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const root = path.dirname(fileURLToPath(import.meta.url));
const logo = path.join(root, "../public/logo.png");
const out = path.join(root, "../src/app/favicon.ico");

const sizes = [16, 32, 48];
const buffers = await Promise.all(
  sizes.map((s) => sharp(logo).resize(s, s).png().toBuffer())
);
const ico = await toIco(buffers);
writeFileSync(out, ico);
console.log(`Wrote favicon.ico (${ico.length} bytes)`);
