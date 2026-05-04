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
    "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=450&fit=crop"
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

// Specific mappings for seed products to ensure unique, relevant images
const nameToImage = {
  // Glasses
  "Coastal Sun Aviators": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=450&fit=crop",
  "Nightline Square Frames": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=450&fit=crop",
  "Monaco Weekend Shades": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=450&fit=crop",
  "Silver Horizon Specs": "https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&h=450&fit=crop",
  "Jetstream Club Glasses": "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&h=450&fit=crop",
  "Palm Light Aviators": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=450&fit=crop",
  "Metro Focus Frames": "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=450&fit=crop",
  "Laguna Tint Shades": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=450&fit=crop",
  "Golden Hour Eyewear": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=450&fit=crop",
  "Mirage Edge Sunglasses": "https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&h=450&fit=crop",
  "Skyline Minimal Frames": "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&h=450&fit=crop",
  "Boardwalk Polar Shades": "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=600&h=450&fit=crop",

  // Jackets
  "Midnight Tailored Jacket": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=450&fit=crop",
  "Harbor Line Bomber": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=450&fit=crop",
  "Westfield Utility Jacket": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=450&fit=crop",
  "Noir Motion Layer": "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=450&fit=crop",
  "Slate Evening Jacket": "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&h=450&fit=crop",
  "Summit Street Bomber": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&h=450&fit=crop",
  "Marina Breeze Jacket": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&h=450&fit=crop",
  "Afterglow Zip Jacket": "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600&h=450&fit=crop",
  "Tailored City Layer": "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&h=450&fit=crop",
  "Northshore Coach Jacket": "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&h=450&fit=crop",
  "Driftline Casual Jacket": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=450&fit=crop",
  "Urban Edge Outerwear": "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=450&fit=crop",

  // Watches
  "Rose Gold Minimal Watch": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=450&fit=crop",
  "Atlas Steel Timepiece": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop",
  "Monochrome Dial Watch": "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=450&fit=crop",
  "Harbor Classic Watch": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=450&fit=crop",
  "Daymark Slim Watch": "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=450&fit=crop",
  "Luxe Edge Chrono": "https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=600&h=450&fit=crop",
  "Evening Gold Wristwatch": "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=600&h=450&fit=crop",
  "Slate Face Watch": "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&h=450&fit=crop",
  "Midtown Signature Timepiece": "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=450&fit=crop",
  "Aster Black Dial Watch": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=450&fit=crop",
  "Crest Leather Watch": "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=600&h=450&fit=crop",
  "Pulse Silver Watch": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=450&fit=crop",

  // Shoes
  "Obsidian Street Sneakers": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop",
  "Motion Grid Runners": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=450&fit=crop",
  "Ashline Daily Sneakers": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=450&fit=crop",
  "Ridge Court Trainers": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=450&fit=crop",
  "Downtown Leather Sneakers": "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=450&fit=crop",
  "Pulse Walk Low Tops": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=450&fit=crop",
  "Metro Pace Shoes": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&h=450&fit=crop",
  "Nightshift Sport Sneakers": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=450&fit=crop",
  "Cleanline Runner Shoes": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=450&fit=crop",
  "Harbor Track Trainers": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=450&fit=crop",
  "Velocity Mono Sneakers": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=450&fit=crop",
  "Boardwalk Canvas Shoes": "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600&h=450&fit=crop",

  // Bags
  "Sandstone Carry Bag": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=450&fit=crop",
  "Monarch Mini Satchel": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=450&fit=crop",
  "Canvas Drift Crossbody": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=450&fit=crop",
  "Noir City Sling": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=450&fit=crop",
  "Portside Leather Bag": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=450&fit=crop",
  "Velvet Lane Mini Bag": "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=450&fit=crop",
  "Marble Street Handbag": "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=450&fit=crop",
  "Luna Fold Crossbody": "https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&h=450&fit=crop",
  "Cinder Carry Tote": "https://images.unsplash.com/photo-1544816153-199d8874766b?w=600&h=450&fit=crop",
  "Daybreak Belt Bag": "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=450&fit=crop",
  "Studio Compact Purse": "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=600&h=450&fit=crop",
  "Riviera Shoulder Bag": "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&h=450&fit=crop",

  // Shirts
  "Ivory Linen Shirt": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=450&fit=crop",
  "Coastline Button Shirt": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=450&fit=crop",
  "Blue Harbor Linen Top": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=450&fit=crop",
  "Studio White Camp Shirt": "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=450&fit=crop",
  "Breeze Fit Formal Shirt": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&h=450&fit=crop",
  "Oakline Casual Shirt": "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=450&fit=crop",
  "Weekend Linen Layer": "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&h=450&fit=crop",
  "Horizon Summer Shirt": "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&h=450&fit=crop",
  "Crisp Day Oxford Shirt": "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=450&fit=crop",
  "Shoreline Evening Shirt": "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=450&fit=crop",
  "Mariner Roll-Sleeve Shirt": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=450&fit=crop",
  "Cloudline Minimal Shirt": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=450&fit=crop",

  // Rings
  "Copper Edge Ring": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=450&fit=crop",
  "Solstice Band Ring": "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&h=450&fit=crop",
  "Noir Stone Signet": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=450&fit=crop",
  "Aurora Stack Ring": "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=600&h=450&fit=crop",
  "Cinder Crest Band": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=450&fit=crop",
  "Luna Minimal Ring": "https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=600&h=450&fit=crop",
  "Canyon Metal Ring": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=450&fit=crop",
  "Velvet Alloy Band": "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=450&fit=crop",
  "Studio Slim Signet": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=450&fit=crop",
  "Bronze Halo Ring": "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&h=450&fit=crop",
  "Orbit Detail Ring": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=450&fit=crop",
  "Daylight Stacking Band": "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600&h=450&fit=crop",

  // Hats
  "Harbor Classic Hat": "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=450&fit=crop",
  "Desert Sun Cap": "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&h=450&fit=crop",
  "Trailmark Street Hat": "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&h=450&fit=crop",
  "Cove Weekend Hat": "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&h=450&fit=crop",
  "Northline Casual Cap": "https://images.unsplash.com/photo-1589131464407-16781216d004?w=600&h=450&fit=crop",
  "Canvas Peak Hat": "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=450&fit=crop",
  "Metro Shade Cap": "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=450&fit=crop",
  "Voyage Summer Hat": "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=600&h=450&fit=crop",
  "Seabreeze Travel Hat": "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&h=450&fit=crop",
  "Cinder Utility Cap": "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&h=450&fit=crop",
  "Ridge Brim Hat": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=450&fit=crop",
  "Coastline Minimal Cap": "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=450&fit=crop"
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

  // Check for specific name mapping first
  if (product?.name && nameToImage[product.name]) {
    return nameToImage[product.name];
  }

  // Pick a curated Unsplash image based on category + name hash
  const key = getCategoryKey(product);
  const images = categoryImages[key];

  if (images && images.length > 0) {
    const index = nameHash(product?.name || "phantom") % images.length;
    return images[index];
  }

  // Fallback: neutral phantom placeholder (extremely reliable)
  return "https://placehold.co/600x450/0c1119/6366f1?text=Phantom+Store";
};

/**
 * Standard error handler for images to swap in a reliable fallback if the primary URL fails.
 * Usage: <img src={...} onError={handleImageError} />
 */
export const handleImageError = (e) => {
  const fallback = "https://placehold.co/600x450/0c1119/6366f1?text=Phantom+Store";
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
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
