// Curated, category-relevant product images from Unsplash
const categoryImages = {
  glasses: [
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1608539619413-073c48b5e63c?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1618677603286-0ec56cb1dc3c?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1516642898673-edd1ced08989?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=600&h=450&fit=crop"
  ],
  jacket: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=450&fit=crop"
  ],
  shirt: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=450&fit=crop"
  ],
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600&h=450&fit=crop"
  ],
  hat: [
    "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1614975059251-992f11792571?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1552060155-89ad2e40ade4?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1542207456-fea9345ac580?w=600&h=450&fit=crop"
  ],
  watch: [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=450&fit=crop"
  ],
  bag: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1612902456551-404b5bce8dbf?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&h=450&fit=crop"
  ],
  ring: [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600&h=450&fit=crop"
  ]
};

// Deterministic hash from product name to pick a consistent image
const nameHash = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const getCategoryKey = (product) => {
  return String(product?.arCategory || product?.category || "")
    .toLowerCase()
    .replace(/s$/, "");
};

export const getProductImageSrc = (product) => {
  const src = product?.images?.[0]?.url;

  // Use real uploaded images if they exist and aren't placeholder services
  if (src && !src.includes("placehold.co") && !src.includes("picsum.photos")) {
    return src;
  }

  // Pick a curated Unsplash image based on category + name hash
  const key = getCategoryKey(product);
  const images = categoryImages[key];

  if (images && images.length > 0) {
    const index = nameHash(product?.name || "phantom") % images.length;
    return images[index];
  }

  // Fallback: generic product image
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop";
};

export const getCategoryLabel = (product) => {
  const key = getCategoryKey(product);
  const labels = {
    glasses: "Eyewear",
    jacket: "Jackets",
    shirt: "Shirts",
    shoes: "Footwear",
    hat: "Hats",
    watch: "Watches",
    bag: "Bags",
    ring: "Jewelry"
  };
  return labels[key] || "Accessory";
};
