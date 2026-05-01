const categoryArtwork = {
  glasses: { bg: "#1c2536", accent: "#7aa2ff", shape: "M95 140c0-17 13-30 30-30h48c12 0 23 7 28 18l8 17h16l8-17c5-11 16-18 28-18h48c17 0 30 13 30 30v22c0 17-13 30-30 30h-48c-13 0-24-8-29-20l-6-13h-34l-6 13c-5 12-16 20-29 20h-48c-17 0-30-13-30-30v-22z" },
  jacket: { bg: "#33243a", accent: "#f2b45a", shape: "M120 70l40-25 40 25 26 64-28 18-14-34v102h-48v-52h-12v52H76V118L62 152l-28-18 26-64 40-25z" },
  shirt: { bg: "#243448", accent: "#8bd3c7", shape: "M120 72l38-26 30 20-18 30v124H70V96L52 66l30-20 38 26z" },
  shoes: { bg: "#1a2130", accent: "#f97373", shape: "M52 154c22 0 36-8 48-26l18-26 16 12c11 8 24 12 38 12h36c12 0 22 10 22 22v22H52c-12 0-22-10-22-22v-8c0-12 10-22 22-22z" },
  watch: { bg: "#2f2632", accent: "#f6c177", shape: "M140 54h20l10 34h-40l10-34zm-18 50h56c13 0 24 11 24 24v28c0 13-11 24-24 24h-56c-13 0-24-11-24-24v-28c0-13 11-24 24-24zm18 92h20l10 34h-40l10-34z" },
  bag: { bg: "#3c2f28", accent: "#d4a373", shape: "M80 102h120l12 96H68l12-96zm34 0V90c0-20 12-34 26-34s26 14 26 34v12h-20V92c0-9-3-16-6-16s-6 7-6 16v10h-20z" },
  ring: { bg: "#4a2f2a", accent: "#ffd166", shape: "M120 126c0-28 22-50 50-50s50 22 50 50-22 50-50 50-50-22-50-50zm24 0c0 14 12 26 26 26s26-12 26-26-12-26-26-26-26 12-26 26z" },
  hat: { bg: "#334255", accent: "#a3be8c", shape: "M72 148c0-8 6-14 14-14h108c8 0 14 6 14 14s-6 14-14 14H86c-8 0-14-6-14-14zm34-18c0-22 16-42 40-42s40 20 40 42h-80z" }
};

const makeArtworkDataUrl = (product) => {
  const key = String(product?.arCategory || product?.category || "").toLowerCase().replace(/s$/, "");
  const artwork = categoryArtwork[key] || { bg: "#202838", accent: "#7c5cff", shape: "M86 84h108v88H86z" };
  const label = String(product?.name || "Phantom Store").slice(0, 28);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 210">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${artwork.bg}"/>
          <stop offset="100%" stop-color="#10141d"/>
        </linearGradient>
      </defs>
      <rect width="280" height="210" rx="18" fill="url(#bg)"/>
      <circle cx="228" cy="44" r="26" fill="${artwork.accent}" fill-opacity="0.18"/>
      <path d="${artwork.shape}" fill="${artwork.accent}"/>
      <text x="24" y="182" fill="#f5f7fb" font-family="Arial, sans-serif" font-size="20" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getProductImageSrc = (product) => {
  const src = product?.images?.[0]?.url;
  if (!src || src.includes("placehold.co")) {
    return makeArtworkDataUrl(product);
  }

  return src;
};
