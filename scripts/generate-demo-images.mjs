import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "demo");
mkdirSync(OUT_DIR, { recursive: true });

const PALETTE = [
  ["#5D6BB3", "#8B82B8"],
  ["#8B82B8", "#C99AB6"],
  ["#C99AB6", "#E6CDD7"],
  ["#5D6BB3", "#C99AB6"],
  ["#8B82B8", "#E6CDD7"],
  ["#C99AB6", "#5D6BB3"],
];

function gradientSvg(w, h, from, to, label) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g)" />
      <circle cx="${w * 0.78}" cy="${h * 0.26}" r="${Math.min(w, h) * 0.16}" fill="#F5F7FF" opacity="0.5" />
      <text x="50%" y="92%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${h * 0.06}" fill="#F5F7FF" opacity="0.85">${label}</text>
    </svg>
  `);
}

async function main() {
  // Cover / banner (wide)
  await sharp(gradientSvg(1200, 675, "#5D6BB3", "#C99AB6", "Demo School"))
    .jpeg({ quality: 85 })
    .toFile(join(OUT_DIR, "cover.jpg"));

  // 6 album photos
  for (let i = 0; i < PALETTE.length; i++) {
    const [from, to] = PALETTE[i];
    await sharp(gradientSvg(1200, 1500, from, to, `Photo ${i + 1}`))
      .jpeg({ quality: 85 })
      .toFile(join(OUT_DIR, `photo-${i + 1}.jpg`));

    await sharp(gradientSvg(400, 500, from, to, `Photo ${i + 1}`))
      .jpeg({ quality: 80 })
      .toFile(join(OUT_DIR, `photo-${i + 1}-thumb.jpg`));
  }

  console.log("Demo images generated in", OUT_DIR);
}

main();
