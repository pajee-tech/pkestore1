/* Starter catalog for PKeStore. Dashboard se sab kuch edit / delete ho sakta hai. */

export type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  bg: [string, string];
  children: { name: string; slug: string; description: string }[];
};

export const CATEGORIES: SeedCategory[] = [
  {
    name: "Smart Gadgets",
    slug: "smart-gadgets",
    icon: "Watch",
    bg: ["#e0f2fe", "#bae6fd"],
    description: "Smart watches, wireless earbuds, speakers aur power banks — roz ki zindagi ko smart banayein.",
    children: [
      { name: "Smart Watches", slug: "smart-watches", description: "Fitness tracking, calls aur notifications wali smart watches." },
      { name: "Earbuds & Audio", slug: "earbuds-audio", description: "Wireless earbuds aur portable Bluetooth speakers." },
      { name: "Power Banks", slug: "power-banks", description: "Fast charging power banks safar aur office ke liye." },
    ],
  },
  {
    name: "Mobile Accessories",
    slug: "mobile-accessories",
    icon: "Smartphone",
    bg: ["#ede9fe", "#ddd6fe"],
    description: "Fast chargers, durable cables, phone stands aur selfie gear — har phone ke liye.",
    children: [
      { name: "Chargers & Cables", slug: "chargers-cables", description: "GaN fast chargers aur braided cables." },
      { name: "Phone Stands & Holders", slug: "phone-stands-holders", description: "Desk aur bed ke liye adjustable stands." },
      { name: "Selfie & Camera Gear", slug: "selfie-camera-gear", description: "Tripods, selfie sticks aur content creator gear." },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    icon: "CookingPot",
    bg: ["#dcfce7", "#bbf7d0"],
    description: "Kitchen ka kaam aasaan karne wale gadgets, tools aur storage solutions.",
    children: [
      { name: "Kitchen Appliances", slug: "kitchen-appliances", description: "Portable blenders aur chhote kitchen appliances." },
      { name: "Kitchen Tools", slug: "kitchen-tools", description: "Choppers, scales aur roz ke kitchen tools." },
      { name: "Storage & Organizers", slug: "storage-organizers", description: "Airtight containers aur organizers." },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    icon: "Sparkles",
    bg: ["#fce7f3", "#fbcfe8"],
    description: "Hair styling tools, skin care devices aur men's grooming essentials.",
    children: [
      { name: "Hair Styling", slug: "hair-styling", description: "Straightener brushes aur hair dryers." },
      { name: "Skin Care Tools", slug: "skin-care-tools", description: "Facial cleansing aur skin care devices." },
      { name: "Men's Grooming", slug: "mens-grooming", description: "Trimmers aur shaving essentials." },
    ],
  },
  {
    name: "Watches & Accessories",
    slug: "watches-accessories",
    icon: "Gem",
    bg: ["#fef3c7", "#fde68a"],
    description: "Classic watches, jewelry aur sunglasses — har look ko complete karein.",
    children: [
      { name: "Men's Watches", slug: "mens-watches", description: "Chronograph aur classic men's watches." },
      { name: "Women's Watches", slug: "womens-watches", description: "Elegant rose gold aur fashion watches." },
      { name: "Jewelry & Eyewear", slug: "jewelry-eyewear", description: "Bracelets, chains aur polarized sunglasses." },
    ],
  },
  {
    name: "Bags & Wallets",
    slug: "bags-wallets",
    icon: "Briefcase",
    bg: ["#e2e8f0", "#cbd5e1"],
    description: "Laptop backpacks, leather wallets aur stylish handbags.",
    children: [
      { name: "Backpacks", slug: "backpacks", description: "Laptop aur travel backpacks." },
      { name: "Wallets", slug: "wallets", description: "Leather wallets aur card holders." },
      { name: "Handbags", slug: "handbags", description: "Tote bags aur everyday handbags." },
    ],
  },
  {
    name: "Health & Fitness",
    slug: "health-fitness",
    icon: "Dumbbell",
    bg: ["#ffedd5", "#fed7aa"],
    description: "Ghar pe workout, recovery aur fitness ke liye zaroori cheezen.",
    children: [
      { name: "Massagers", slug: "massagers", description: "Massage guns aur relaxation devices." },
      { name: "Workout Gear", slug: "workout-gear", description: "Resistance bands, hand grips aur home gym gear." },
      { name: "Yoga & Recovery", slug: "yoga-recovery", description: "Yoga mats aur stretching accessories." },
    ],
  },
  {
    name: "Kids & Toys",
    slug: "kids-toys",
    icon: "Puzzle",
    bg: ["#fee2e2", "#fecaca"],
    description: "Educational toys, RC cars aur creative play — bachon ke liye fun aur learning.",
    children: [
      { name: "Educational Toys", slug: "educational-toys", description: "Dimagh tez karne wale puzzles aur cubes." },
      { name: "RC Toys", slug: "rc-toys", description: "Remote control cars aur stunt toys." },
      { name: "Creative Play", slug: "creative-play", description: "Drawing tablets aur building blocks." },
    ],
  },
  {
    name: "Car Accessories",
    slug: "car-accessories",
    icon: "Car",
    bg: ["#f1f5f9", "#e2e8f0"],
    description: "Car electronics, cleaning aur mounts — har drive ko behtar banayein.",
    children: [
      { name: "Car Electronics", slug: "car-electronics", description: "Dash cams aur Bluetooth FM transmitters." },
      { name: "Car Care", slug: "car-care", description: "Portable vacuums aur cleaning tools." },
      { name: "Car Mounts", slug: "car-mounts", description: "Magnetic aur vent phone holders." },
    ],
  },
  {
    name: "Lights & Electricals",
    slug: "lights-electricals",
    icon: "Lightbulb",
    bg: ["#fef9c3", "#fef08a"],
    description: "Smart bulbs, LED strips, solar lights aur decor lamps.",
    children: [
      { name: "Smart Lighting", slug: "smart-lighting", description: "WiFi bulbs aur rechargeable desk lamps." },
      { name: "Solar Lights", slug: "solar-lights", description: "Load shedding mein bhi roshan — solar lights." },
      { name: "Decor Lights", slug: "decor-lights", description: "RGB LED strips aur moon lamps." },
    ],
  },
];

export type SeedProduct = {
  name: string;
  slug: string;
  category: string; // child category slug
  kind: string; // illustration kind (seed images)
  bg: [string, string];
  price: number;
  comparePrice: number;
  costPrice: number;
  badge?: string;
  featured?: boolean;
  rating: number;
  reviews: number;
  sold: number;
  short: string;
  description: string;
  features: string[];
  specs: [string, string][];
  supplier: string;
};

const sup = { local: "Local Supplier (Lahore)", ali: "AliExpress Dropship", khi: "Wholesale Market (Karachi)" };

export const PRODUCTS: SeedProduct[] = [
  // ── Smart Gadgets
  {
    name: "ProFit Ultra Smart Watch 2.0\" AMOLED",
    slug: "profit-ultra-smart-watch",
    category: "smart-watches",
    kind: "smartwatch",
    bg: ["#e0f2fe", "#7dd3fc"],
    price: 4499, comparePrice: 7999, costPrice: 2900, badge: "Best Seller", featured: true, rating: 4.7, reviews: 214, sold: 1240,
    short: "2.0\" AMOLED display, Bluetooth calling, heart rate, SpO2 aur 7 din ki battery — waterproof IP68.",
    description: `ProFit Ultra aap ki fitness aur roz ki zindagi ka smart saathi hai. Bright **2.0" AMOLED display** dhoop mein bhi saaf nazar aata hai, aur Bluetooth calling se aap wrist se hi calls sun aur kar sakte hain.

## Kyun khareedein?
- 100+ sports modes — walking, running, cycling, cricket
- Heart rate, SpO2, sleep aur stress monitoring
- WhatsApp, SMS aur call notifications
- Magnetic charger — 2 ghante mein full charge, 7 din battery

Box mein: Smart Watch, magnetic charging cable, user manual.`,
    features: ["2.0\" AMOLED always-on display", "Bluetooth calling with mic & speaker", "Heart rate, SpO2 & sleep tracking", "IP68 water resistant", "7 days battery life"],
    specs: [["Display", "2.0\" AMOLED, 410×502"], ["Battery", "300mAh (up to 7 days)"], ["Connectivity", "Bluetooth 5.3"], ["Water Resistance", "IP68"], ["Compatibility", "Android 8+ / iOS 12+"], ["Warranty", "7 days checking warranty"]],
    supplier: sup.local,
  },
  {
    name: "AirBeat Pro Wireless Earbuds ANC",
    slug: "airbeat-pro-wireless-earbuds",
    category: "earbuds-audio",
    kind: "earbuds",
    bg: ["#f1f5f9", "#cbd5e1"],
    price: 3299, comparePrice: 5499, costPrice: 1900, badge: "Hot", featured: true, rating: 4.6, reviews: 187, sold: 980,
    short: "Active noise cancellation, deep bass, 30 ghante playtime aur low-latency gaming mode.",
    description: `AirBeat Pro earbuds ka **ANC (Active Noise Cancellation)** traffic aur office ka shor kam kar deta hai, taake aap sirf apni music sunein.

## Features
- 13mm drivers ke sath deep bass
- Touch controls — play, pause, calls, voice assistant
- Charging case ke sath **30 ghante** total playtime
- Gaming mode: 60ms low latency
- ENC mics se calls pe saaf awaaz`,
    features: ["Active Noise Cancellation (ANC)", "30 hours total playtime", "Bluetooth 5.3 instant pairing", "Low-latency gaming mode", "Type-C fast charging"],
    specs: [["Bluetooth", "5.3"], ["Playtime", "6h (buds) + 24h (case)"], ["Charging", "USB Type-C"], ["Water Resistance", "IPX5"], ["Driver", "13mm dynamic"]],
    supplier: sup.ali,
  },
  {
    name: "BoomBox Mini Portable Bluetooth Speaker",
    slug: "boombox-mini-bluetooth-speaker",
    category: "earbuds-audio",
    kind: "speaker",
    bg: ["#ccfbf1", "#5eead4"],
    price: 2799, comparePrice: 4299, costPrice: 1600, rating: 4.5, reviews: 96, sold: 430,
    short: "360° sound, extra bass, 12 ghante battery aur waterproof design — picnic aur room dono ke liye.",
    description: `Chhota size, bara sound! BoomBox Mini **10W stereo sound** aur passive bass radiator ke sath aata hai.

- 12 ghante non-stop music
- TWS mode: do speakers ko pair kar ke stereo sound
- USB, TF card aur FM radio support
- IPX6 waterproof — barish ya pool party ka koi masla nahi`,
    features: ["10W stereo sound with extra bass", "12 hours battery", "TWS pairing", "IPX6 waterproof", "FM radio & TF card"],
    specs: [["Output", "10W"], ["Battery", "2000mAh"], ["Bluetooth", "5.0"], ["Inputs", "TF card, USB, AUX"], ["Water Resistance", "IPX6"]],
    supplier: sup.local,
  },
  {
    name: "PowerMax 20000mAh Fast Charging Power Bank",
    slug: "powermax-20000mah-power-bank",
    category: "power-banks",
    kind: "powerbank",
    bg: ["#e0e7ff", "#a5b4fc"],
    price: 3999, comparePrice: 5999, costPrice: 2500, badge: "New", featured: true, rating: 4.7, reviews: 152, sold: 760,
    short: "20000mAh capacity, 22.5W PD fast charging, digital display — phone 4-5 dafa full charge.",
    description: `Load shedding ho ya lamba safar, PowerMax aap ka phone band nahi hone dega.

## Highlights
- **20000mAh** real capacity
- 22.5W PD + QC 3.0 fast charging
- Ek waqt mein 3 devices charge
- Digital display se exact battery % dekhein
- Over-charge aur short-circuit protection`,
    features: ["20000mAh real capacity", "22.5W PD fast charging", "3 devices at once", "Digital battery display", "Multi-layer safety protection"],
    specs: [["Capacity", "20000mAh"], ["Output", "22.5W max (PD/QC)"], ["Ports", "2× USB-A, 1× Type-C"], ["Weight", "380g"], ["Recharge Time", "5–6 hours"]],
    supplier: sup.local,
  },

  // ── Mobile Accessories
  {
    name: "65W GaN Fast Charger Dual Port",
    slug: "65w-gan-fast-charger",
    category: "chargers-cables",
    kind: "charger",
    bg: ["#ede9fe", "#c4b5fd"],
    price: 2999, comparePrice: 4499, costPrice: 1700, badge: "Best Seller", featured: true, rating: 4.8, reviews: 233, sold: 1410,
    short: "GaN technology, 65W output — phone, tablet aur laptop sab ek charger se fast charge.",
    description: `GaN (Gallium Nitride) technology ki wajah se ye charger **chhota, thanda aur zyada powerful** hai.

- 65W total output: laptop bhi charge
- Type-C PD + USB-A QC ports
- Smart chip device ke hisaab se power deta hai
- Heat, surge aur short-circuit protection`,
    features: ["65W GaN technology", "USB-C PD + USB-A QC", "Charges phones, tablets & laptops", "Compact & cool running", "Smart power distribution"],
    specs: [["Total Output", "65W"], ["Ports", "1× Type-C, 1× USB-A"], ["Input", "100–240V"], ["Plug", "2-pin (Pakistan compatible)"]],
    supplier: sup.ali,
  },
  {
    name: "3-in-1 Braided Fast Charging Cable",
    slug: "3-in-1-braided-charging-cable",
    category: "chargers-cables",
    kind: "cable",
    bg: ["#f5f3ff", "#ddd6fe"],
    price: 899, comparePrice: 1499, costPrice: 420, rating: 4.4, reviews: 318, sold: 2100,
    short: "Type-C, Lightning aur Micro USB — ek cable, teen connectors. Nylon braided, tangle-free.",
    description: `Ghar mein Android, iPhone aur purane devices sab hain? Ye ek cable sab ke liye kaafi hai.

- Nylon braided — 10,000+ bends tested
- 3A fast charging
- 1.2 meter length
- Aluminium connectors`,
    features: ["3 connectors in one cable", "Nylon braided durability", "3A fast charging", "1.2m length"],
    specs: [["Connectors", "Type-C, Lightning, Micro USB"], ["Current", "3A max"], ["Length", "1.2m"], ["Material", "Nylon braided"]],
    supplier: sup.khi,
  },
  {
    name: "Foldable Aluminium Phone & Tablet Stand",
    slug: "foldable-aluminium-phone-stand",
    category: "phone-stands-holders",
    kind: "phonestand",
    bg: ["#dbeafe", "#93c5fd"],
    price: 1299, comparePrice: 1999, costPrice: 650, rating: 4.6, reviews: 141, sold: 690,
    short: "Height aur angle adjustable, anti-slip pads — video calls, recipes aur online classes ke liye.",
    description: `Mazboot aluminium stand jo phone aur 12.9" tak tablets ko steady rakhta hai.

- 270° angle adjust, height adjustable
- Fold kar ke pocket mein
- Silicone pads se phone pe scratch nahi`,
    features: ["Aluminium alloy body", "Height & angle adjustable", "Fits phones & tablets up to 12.9\"", "Foldable & portable"],
    specs: [["Material", "Aluminium alloy + silicone"], ["Compatibility", "4\"–12.9\" devices"], ["Weight", "210g"]],
    supplier: sup.local,
  },
  {
    name: "Selfie Stick Tripod with Bluetooth Remote",
    slug: "selfie-stick-tripod-remote",
    category: "selfie-camera-gear",
    kind: "tripod",
    bg: ["#fce7f3", "#f9a8d4"],
    price: 1599, comparePrice: 2499, costPrice: 800, badge: "Hot", rating: 4.5, reviews: 204, sold: 1150,
    short: "Selfie stick + tripod 2-in-1, detachable remote, 360° rotation — TikTok aur vlogs ke liye perfect.",
    description: `Content creators ke liye must-have! Stick ko kholen to selfie stick, legs kholen to tripod.

- Detachable Bluetooth remote (10m range)
- 360° rotating phone clamp
- 102cm tak extendable
- Halka aur bag-friendly`,
    features: ["2-in-1 selfie stick & tripod", "Wireless Bluetooth remote", "360° rotation", "Extends up to 102cm"],
    specs: [["Max Length", "102cm"], ["Remote Range", "10m"], ["Phone Width", "56–90mm"], ["Weight", "180g"]],
    supplier: sup.khi,
  },

  // ── Home & Kitchen
  {
    name: "FreshBlend Rechargeable Portable Blender",
    slug: "freshblend-portable-blender",
    category: "kitchen-appliances",
    kind: "blender",
    bg: ["#fce7f3", "#fbcfe8"],
    price: 2499, comparePrice: 3999, costPrice: 1400, badge: "Best Seller", featured: true, rating: 4.5, reviews: 276, sold: 1520,
    short: "USB rechargeable, 6 stainless blades — shakes, smoothies aur juice kahin bhi banayein.",
    description: `Gym, office ya travel — FreshBlend se 30 seconds mein fresh smoothie tayyar.

- 6 stainless steel blades
- 380ml BPA-free jar
- USB Type-C charging, 15 blends per charge
- Safety lock: jar sahi na lage to motor nahi chalegi`,
    features: ["6 stainless steel blades", "USB-C rechargeable", "380ml BPA-free jar", "Safety lock design"],
    specs: [["Capacity", "380ml"], ["Battery", "2000mAh"], ["Blades", "6× stainless steel"], ["Charging", "Type-C, 3 hours"]],
    supplier: sup.local,
  },
  {
    name: "12-in-1 Vegetable Chopper & Slicer",
    slug: "12-in-1-vegetable-chopper",
    category: "kitchen-tools",
    kind: "chopper",
    bg: ["#dcfce7", "#86efac"],
    price: 1899, comparePrice: 2999, costPrice: 950, featured: true, rating: 4.6, reviews: 341, sold: 1870,
    short: "Pyaz, tamatar, sabzi — seconds mein chop, slice, grate. 12 blades aur container ke sath.",
    description: `Kitchen ka sab se bara time-saver! Ek press mein pyaz bareek kat jata hai — aansu bhi nahi aate.

- 12 interchangeable blades
- 1.5L container
- Food-grade ABS aur stainless steel
- Dishwasher safe`,
    features: ["12 interchangeable blades", "1.5L collection container", "Food-grade materials", "Easy to clean"],
    specs: [["Blades", "12 types"], ["Container", "1.5L"], ["Material", "ABS + stainless steel"]],
    supplier: sup.khi,
  },
  {
    name: "Digital Kitchen Weighing Scale 10kg",
    slug: "digital-kitchen-scale-10kg",
    category: "kitchen-tools",
    kind: "scale",
    bg: ["#f0fdf4", "#bbf7d0"],
    price: 1199, comparePrice: 1799, costPrice: 600, rating: 4.4, reviews: 119, sold: 640,
    short: "1g accuracy, 10kg capacity, tare function — baking aur diet ke liye accurate measurement.",
    description: `Baking ho ya diet plan, exact weight zaroori hai.

- 1 gram accuracy, 10kg tak
- Tare (zero) function
- g, kg, oz, lb units
- Batteries included`,
    features: ["1g precision", "10kg capacity", "Tare function", "4 measuring units"],
    specs: [["Capacity", "10kg"], ["Accuracy", "1g"], ["Power", "2× AAA (included)"], ["Units", "g / kg / oz / lb"]],
    supplier: sup.local,
  },
  {
    name: "Airtight Food Storage Containers (Set of 3)",
    slug: "airtight-food-storage-set",
    category: "storage-organizers",
    kind: "containers",
    bg: ["#ecfccb", "#d9f99d"],
    price: 1499, comparePrice: 2299, costPrice: 760, rating: 4.5, reviews: 88, sold: 410,
    short: "BPA-free, airtight lock lids — daalen, chawal, masalay aur snacks fresh rakhein.",
    description: `Kitchen ko organized aur khane ko fresh rakhein.

- 3 sizes: 0.8L, 1.4L, 2.2L
- Airtight silicone seal
- Transparent — andar ka saaman nazar aata hai
- Stackable design`,
    features: ["3 different sizes", "Airtight silicone seal", "BPA-free transparent body", "Stackable"],
    specs: [["Sizes", "0.8L, 1.4L, 2.2L"], ["Material", "BPA-free PP"], ["Lid", "Locking with silicone seal"]],
    supplier: sup.khi,
  },

  // ── Beauty
  {
    name: "SilkStraight Ceramic Hair Straightener Brush",
    slug: "silkstraight-hair-straightener-brush",
    category: "hair-styling",
    kind: "straightener",
    bg: ["#f5f3ff", "#c4b5fd"],
    price: 2699, comparePrice: 4499, costPrice: 1500, badge: "Hot", featured: true, rating: 4.6, reviews: 198, sold: 1020,
    short: "Brush karte hi baal straight — ceramic coating, 5 heat levels, anti-scald tips.",
    description: `Straightener aur brush ek sath! Normal brush ki tarah use karein, baal silky aur straight.

- Ceramic + ionic technology — frizz kam
- 5 temperature levels (150°C–230°C)
- 60 seconds mein garam
- Anti-scald bristles — scalp safe`,
    features: ["Ceramic ionic coating", "5 heat settings", "Heats in 60 seconds", "Anti-scald tips", "Auto shut-off"],
    specs: [["Temperature", "150°C – 230°C"], ["Power", "50W"], ["Cable", "1.8m 360° swivel"], ["Auto-off", "After 60 min"]],
    supplier: sup.ali,
  },
  {
    name: "Professional Ionic Hair Dryer 2200W",
    slug: "professional-ionic-hair-dryer",
    category: "hair-styling",
    kind: "hairdryer",
    bg: ["#fee2e2", "#fca5a5"],
    price: 3499, comparePrice: 5499, costPrice: 2000, rating: 4.5, reviews: 74, sold: 360,
    short: "2200W powerful motor, ionic care, 3 heat + 2 speed settings, cool shot button.",
    description: `Salon jaisa blow-dry ghar par.

- 2200W AC motor — jaldi sukhaye
- Negative ion technology — shine aur kam frizz
- 3 heat, 2 speed settings + cool shot
- Concentrator nozzle included`,
    features: ["2200W AC motor", "Ionic hair care", "3 heat & 2 speed settings", "Cool shot button"],
    specs: [["Power", "2200W"], ["Settings", "3 heat / 2 speed"], ["Cable", "1.8m"], ["Accessories", "Concentrator nozzle"]],
    supplier: sup.local,
  },
  {
    name: "SoftGlow Silicone Facial Cleansing Brush",
    slug: "softglow-facial-cleansing-brush",
    category: "skin-care-tools",
    kind: "facebrush",
    bg: ["#fdf2f8", "#f9a8d4"],
    price: 1799, comparePrice: 2799, costPrice: 850, rating: 4.4, reviews: 92, sold: 470,
    short: "Soft silicone bristles, sonic vibration — makeup aur dirt gehrai se saaf, waterproof.",
    description: `Haathon se 6 guna behtar cleansing.

- Medical-grade silicone — bacteria nahi
- 5 vibration levels
- IPX7 waterproof — shower mein use karein
- USB rechargeable, 90 din tak chalay`,
    features: ["Soft medical-grade silicone", "5 sonic vibration levels", "IPX7 waterproof", "USB rechargeable"],
    specs: [["Material", "Silicone"], ["Levels", "5"], ["Water Resistance", "IPX7"], ["Battery", "Up to 90 uses"]],
    supplier: sup.ali,
  },
  {
    name: "GroomPro Cordless Beard & Hair Trimmer",
    slug: "groompro-cordless-trimmer",
    category: "mens-grooming",
    kind: "trimmer",
    bg: ["#fef3c7", "#fcd34d"],
    price: 2299, comparePrice: 3499, costPrice: 1250, featured: true, rating: 4.6, reviews: 167, sold: 890,
    short: "Stainless steel blades, 4 guide combs, 120 minute runtime, LED battery indicator.",
    description: `Beard shape karein ya hair cut — GroomPro sab karta hai.

- Self-sharpening stainless steel blades
- 4 guide combs (1.5mm–12mm)
- 120 minute cordless runtime
- Washable head`,
    features: ["Self-sharpening steel blades", "4 guide combs", "120 min runtime", "Washable head", "USB charging"],
    specs: [["Runtime", "120 minutes"], ["Charging", "USB, 2 hours"], ["Combs", "1.5, 3, 6, 12mm"], ["Blade", "Stainless steel"]],
    supplier: sup.local,
  },

  // ── Watches & Accessories
  {
    name: "Classic Chronograph Men's Watch – Leather",
    slug: "classic-chronograph-mens-watch",
    category: "mens-watches",
    kind: "menwatch",
    bg: ["#fef3c7", "#fbbf24"],
    price: 3999, comparePrice: 6499, costPrice: 2200, badge: "Premium", featured: true, rating: 4.7, reviews: 133, sold: 610,
    short: "Working chronograph, genuine leather strap, stainless case — office aur events dono ke liye.",
    description: `Ek classic watch jo har outfit ke sath jachti hai.

- Working chronograph sub-dials
- Japanese quartz movement
- Genuine leather strap
- 3 ATM water resistant
- Gift box packaging`,
    features: ["Working chronograph", "Japanese quartz movement", "Genuine leather strap", "3 ATM water resistance", "Gift box included"],
    specs: [["Case", "44mm stainless steel"], ["Movement", "Japanese quartz"], ["Strap", "Genuine leather, 22mm"], ["Water Resistance", "3 ATM"]],
    supplier: sup.khi,
  },
  {
    name: "Rose Gold Mesh Women's Watch",
    slug: "rose-gold-mesh-womens-watch",
    category: "womens-watches",
    kind: "womenwatch",
    bg: ["#fff1f2", "#fecdd3"],
    price: 2999, comparePrice: 4999, costPrice: 1500, rating: 4.6, reviews: 108, sold: 520,
    short: "Slim rose gold case, magnetic mesh strap — elegant design, perfect gift.",
    description: `Minimal aur elegant — ye watch har mauqe ke liye.

- Slim 8mm case
- Magnetic mesh strap — kisi bhi wrist pe fit
- Scratch-resistant glass
- Gift box packaging`,
    features: ["Slim rose gold case", "Magnetic adjustable mesh strap", "Scratch-resistant glass", "Gift box included"],
    specs: [["Case", "34mm alloy, rose gold"], ["Thickness", "8mm"], ["Strap", "Magnetic mesh"], ["Water Resistance", "Splash proof"]],
    supplier: sup.khi,
  },
  {
    name: "Stainless Steel Cuban Link Bracelet",
    slug: "stainless-steel-cuban-bracelet",
    category: "jewelry-eyewear",
    kind: "bracelet",
    bg: ["#fefce8", "#fde68a"],
    price: 1499, comparePrice: 2499, costPrice: 650, rating: 4.5, reviews: 64, sold: 300,
    short: "18K gold plated stainless steel, tarnish-free — kaala nahi hota, pani se kharab nahi.",
    description: `Bold aur stylish Cuban link bracelet.

- 316L stainless steel, 18K gold plating
- Tarnish aur rust free
- Secure box clasp
- 8mm width, 21cm length`,
    features: ["316L stainless steel", "18K gold plated", "Tarnish & water resistant", "Secure box clasp"],
    specs: [["Material", "316L stainless steel"], ["Plating", "18K gold"], ["Width", "8mm"], ["Length", "21cm"]],
    supplier: sup.ali,
  },
  {
    name: "Polarized UV400 Aviator Sunglasses",
    slug: "polarized-aviator-sunglasses",
    category: "jewelry-eyewear",
    kind: "sunglasses",
    bg: ["#e0f2fe", "#bae6fd"],
    price: 1299, comparePrice: 2199, costPrice: 520, badge: "New", rating: 4.4, reviews: 77, sold: 380,
    short: "Polarized lenses, UV400 protection, metal frame — driving aur garmi ke liye.",
    description: `Dhoop ki chamak (glare) khatam, aankhen mehfooz.

- Polarized lenses
- UV400 — 100% UVA/UVB protection
- Lightweight metal frame
- Case aur cleaning cloth ke sath`,
    features: ["Polarized anti-glare lenses", "UV400 protection", "Metal frame", "Case & cloth included"],
    specs: [["Lens", "Polarized TAC"], ["Protection", "UV400"], ["Frame", "Metal alloy"], ["Lens Width", "58mm"]],
    supplier: sup.khi,
  },

  // ── Bags & Wallets
  {
    name: "Anti-Theft Laptop Backpack with USB Port",
    slug: "anti-theft-laptop-backpack",
    category: "backpacks",
    kind: "backpack",
    bg: ["#e2e8f0", "#94a3b8"],
    price: 3499, comparePrice: 5499, costPrice: 1900, badge: "Best Seller", featured: true, rating: 4.7, reviews: 158, sold: 720,
    short: "15.6\" laptop compartment, hidden zips, USB charging port, water-resistant fabric.",
    description: `University, office aur travel — ek bag sab ke liye.

- 15.6" padded laptop compartment
- Anti-theft hidden zippers
- Built-in USB charging port
- Water-resistant Oxford fabric
- Breathable back padding`,
    features: ["Fits 15.6\" laptop", "Anti-theft hidden zips", "USB charging port", "Water-resistant fabric", "Ergonomic padding"],
    specs: [["Capacity", "25L"], ["Laptop", "Up to 15.6\""], ["Material", "Oxford polyester"], ["Size", "45 × 30 × 15 cm"]],
    supplier: sup.local,
  },
  {
    name: "Genuine Leather RFID Men's Wallet",
    slug: "genuine-leather-rfid-wallet",
    category: "wallets",
    kind: "wallet",
    bg: ["#fef3c7", "#d6b38a"],
    price: 1799, comparePrice: 2799, costPrice: 850, rating: 4.6, reviews: 121, sold: 590,
    short: "Original leather, RFID blocking, 8 card slots — slim bifold design.",
    description: `Pakistani leather se bana slim wallet.

- 100% genuine cow leather
- RFID blocking — cards safe
- 8 card slots, 2 note compartments, ID window
- Gift box packaging`,
    features: ["Genuine cow leather", "RFID blocking", "8 card slots", "Slim bifold", "Gift box"],
    specs: [["Material", "Genuine leather"], ["Card Slots", "8"], ["Size", "11.5 × 9.5 cm"], ["RFID", "Yes"]],
    supplier: sup.local,
  },
  {
    name: "Everyday Tote Handbag – Vegan Leather",
    slug: "everyday-tote-handbag",
    category: "handbags",
    kind: "tote",
    bg: ["#fdf4ff", "#f5d0fe"],
    price: 2999, comparePrice: 4499, costPrice: 1600, badge: "New", rating: 4.5, reviews: 59, sold: 260,
    short: "Spacious tote, vegan leather, zipper closure aur andar pockets — office aur shopping ke liye.",
    description: `Stylish aur kaafi jagah wala tote bag.

- Premium vegan (PU) leather
- Zipper closure
- 3 inner pockets
- Laptop / tablet fit`,
    features: ["Premium vegan leather", "Zipper closure", "3 inner pockets", "Fits 13\" laptop"],
    specs: [["Material", "PU leather"], ["Size", "38 × 30 × 13 cm"], ["Closure", "Zipper"], ["Strap Drop", "25cm"]],
    supplier: sup.khi,
  },

  // ── Health & Fitness
  {
    name: "Mini Massage Gun – 6 Heads, 30 Speeds",
    slug: "mini-massage-gun",
    category: "massagers",
    kind: "massagegun",
    bg: ["#ffedd5", "#fdba74"],
    price: 4499, comparePrice: 6999, costPrice: 2700, badge: "Hot", featured: true, rating: 4.7, reviews: 143, sold: 650,
    short: "Deep tissue massage, 30 speed levels, 6 heads, quiet motor — workout recovery aur thakan door.",
    description: `Gym ke baad muscles ki thakan aur dard door karein.

- 30 speed levels
- 6 massage heads (har muscle ke liye)
- Quiet brushless motor (<45dB)
- Type-C charging, 6 ghante use`,
    features: ["30 speed levels", "6 interchangeable heads", "Quiet brushless motor", "6 hours battery", "Carry case"],
    specs: [["Speeds", "30"], ["Heads", "6"], ["Battery", "2500mAh"], ["Noise", "< 45dB"], ["Weight", "450g"]],
    supplier: sup.ali,
  },
  {
    name: "Resistance Loop Bands Set (5 Levels)",
    slug: "resistance-loop-bands-set",
    category: "workout-gear",
    kind: "bands",
    bg: ["#fff7ed", "#fed7aa"],
    price: 999, comparePrice: 1599, costPrice: 380, rating: 4.5, reviews: 211, sold: 1300,
    short: "5 resistance levels, natural latex — ghar pe full body workout, bag mein carry.",
    description: `Gym nahi ja sakte? Ye bands ghar ko gym bana dete hain.

- 5 levels: extra light se extra heavy
- Natural latex — toot'ne ka dar nahi
- Carry pouch aur exercise guide`,
    features: ["5 resistance levels", "Natural latex", "Carry pouch", "Exercise guide"],
    specs: [["Levels", "5 (5–40 lbs)"], ["Material", "Natural latex"], ["Size", "60 × 5 cm"]],
    supplier: sup.khi,
  },
  {
    name: "Adjustable Hand Grip Strengthener 5–60kg",
    slug: "adjustable-hand-grip-strengthener",
    category: "workout-gear",
    kind: "handgrip",
    bg: ["#ccfbf1", "#99f6e4"],
    price: 899, comparePrice: 1399, costPrice: 360, rating: 4.4, reviews: 97, sold: 540,
    short: "5 se 60kg tak adjustable resistance, anti-slip handles — grip aur forearms strong.",
    description: `Forearm aur grip strength ke liye best tool.

- 5–60kg adjustable
- Counter se reps count karein
- Non-slip silicone handles`,
    features: ["5–60kg adjustable", "Non-slip handles", "Compact & portable"],
    specs: [["Resistance", "5–60kg"], ["Material", "ABS + steel spring"]],
    supplier: sup.khi,
  },
  {
    name: "Premium 6mm Anti-Slip Yoga Mat",
    slug: "premium-6mm-yoga-mat",
    category: "yoga-recovery",
    kind: "yogamat",
    bg: ["#f5f3ff", "#ddd6fe"],
    price: 2199, comparePrice: 3299, costPrice: 1150, rating: 4.6, reviews: 84, sold: 410,
    short: "6mm thick TPE, dono taraf anti-slip, carry strap — yoga, stretching aur home workout.",
    description: `Joints ko aaram, grip mazboot.

- 6mm thick eco-friendly TPE
- Double-sided anti-slip
- Carrying strap included
- 183 × 61 cm`,
    features: ["6mm cushioning", "Double-sided anti-slip", "Eco-friendly TPE", "Carry strap"],
    specs: [["Size", "183 × 61 cm"], ["Thickness", "6mm"], ["Material", "TPE"]],
    supplier: sup.local,
  },

  // ── Kids & Toys
  {
    name: "Speed Magic Cube 3x3 (Stickerless)",
    slug: "speed-magic-cube-3x3",
    category: "educational-toys",
    kind: "cube",
    bg: ["#fee2e2", "#fecaca"],
    price: 599, comparePrice: 999, costPrice: 230, rating: 4.7, reviews: 256, sold: 1600,
    short: "Smooth turning speed cube — focus, memory aur problem solving skills behtar.",
    description: `Bachon aur baron dono ke liye brain game.

- Stickerless — rang kabhi nahi utarte
- Smooth corner cutting
- Beginner guide ke sath`,
    features: ["Stickerless design", "Smooth turning", "Beginner guide"],
    specs: [["Type", "3×3"], ["Size", "56mm"], ["Age", "6+"]],
    supplier: sup.khi,
  },
  {
    name: "4WD Stunt RC Car – Rechargeable",
    slug: "4wd-stunt-rc-car",
    category: "rc-toys",
    kind: "rccar",
    bg: ["#fef2f2", "#fca5a5"],
    price: 3999, comparePrice: 5999, costPrice: 2300, badge: "Hot", featured: true, rating: 4.6, reviews: 118, sold: 540,
    short: "360° flips, 4WD, 2.4GHz remote, rechargeable battery — off-road fun.",
    description: `Bachon ka favorite gift!

- 4 wheel drive — ghaas, mitti, carpet sab pe
- 360° flip aur rotation stunts
- 2.4GHz remote, 50m range
- Rechargeable battery, 25 min play`,
    features: ["4WD off-road", "360° flip stunts", "2.4GHz remote", "Rechargeable battery"],
    specs: [["Scale", "1:16"], ["Range", "50m"], ["Play Time", "20–25 min"], ["Age", "6+"]],
    supplier: sup.local,
  },
  {
    name: "LCD Drawing & Writing Tablet 10\"",
    slug: "lcd-drawing-writing-tablet",
    category: "creative-play",
    kind: "drawtablet",
    bg: ["#dbeafe", "#bfdbfe"],
    price: 1199, comparePrice: 1899, costPrice: 520, rating: 4.5, reviews: 175, sold: 980,
    short: "Colorful LCD screen, one-click erase, lock button — paper bachayein, creativity barhayein.",
    description: `Kaghaz aur colors ka mess khatam.

- 10" colorful LCD
- One-click erase + lock
- Stylus included
- Aankhon ke liye safe (no blue light)`,
    features: ["10\" colorful LCD", "One-click erase", "Eye-safe screen", "Stylus included"],
    specs: [["Screen", "10\" LCD"], ["Battery", "Replaceable button cell"], ["Age", "3+"]],
    supplier: sup.khi,
  },
  {
    name: "Creative Building Blocks Set – 300 pcs",
    slug: "creative-building-blocks-set",
    category: "creative-play",
    kind: "blocks",
    bg: ["#fef9c3", "#fde68a"],
    price: 1799, comparePrice: 2799, costPrice: 900, rating: 4.6, reviews: 66, sold: 300,
    short: "300 colorful pieces, non-toxic ABS plastic — bachon ki imagination aur motor skills.",
    description: `Ghar, cars, robots — jo chahein banayein.

- 300 pieces, 12 colors
- Non-toxic ABS plastic
- Storage box included`,
    features: ["300 pieces", "Non-toxic ABS", "Storage box"],
    specs: [["Pieces", "300"], ["Material", "ABS plastic"], ["Age", "4+"]],
    supplier: sup.khi,
  },

  // ── Car Accessories
  {
    name: "Bluetooth FM Transmitter & Fast Car Charger",
    slug: "bluetooth-fm-transmitter-car-charger",
    category: "car-electronics",
    kind: "fmtransmitter",
    bg: ["#e0f2fe", "#93c5fd"],
    price: 1699, comparePrice: 2599, costPrice: 800, rating: 4.4, reviews: 132, sold: 700,
    short: "Purani car mein Bluetooth music aur hands-free calls + dual USB fast charging.",
    description: `Car stereo mein Bluetooth nahi? Koi baat nahi.

- Bluetooth 5.3 music streaming
- Hands-free calls with mic
- Dual USB (QC 3.0) charging
- USB / TF card music support`,
    features: ["Bluetooth 5.3", "Hands-free calling", "QC 3.0 dual USB", "LED display"],
    specs: [["Bluetooth", "5.3"], ["Output", "QC 3.0 + 2.4A"], ["FM Range", "87.5–108 MHz"]],
    supplier: sup.local,
  },
  {
    name: "Full HD 1080p Car Dash Camera",
    slug: "full-hd-car-dash-camera",
    category: "car-electronics",
    kind: "dashcam",
    bg: ["#f1f5f9", "#cbd5e1"],
    price: 4999, comparePrice: 7499, costPrice: 3000, badge: "New", featured: true, rating: 4.5, reviews: 71, sold: 280,
    short: "1080p recording, 170° wide angle, night vision, loop recording aur G-sensor.",
    description: `Road pe har lamha record — accident ya claim ki surat mein saboot.

- Full HD 1080p
- 170° wide angle lens
- Night vision
- Loop recording + G-sensor (emergency file lock)`,
    features: ["Full HD 1080p", "170° wide angle", "Night vision", "Loop recording", "G-sensor"],
    specs: [["Resolution", "1920×1080"], ["Angle", "170°"], ["Storage", "MicroSD up to 64GB"], ["Screen", "3\" IPS"]],
    supplier: sup.ali,
  },
  {
    name: "Cordless Portable Car Vacuum Cleaner",
    slug: "cordless-car-vacuum-cleaner",
    category: "car-care",
    kind: "carvacuum",
    bg: ["#dbeafe", "#bfdbfe"],
    price: 3299, comparePrice: 4999, costPrice: 1900, rating: 4.4, reviews: 89, sold: 420,
    short: "Powerful suction, cordless, washable HEPA filter — car aur ghar dono ki safai.",
    description: `Car seats aur carpet se mitti, crumbs aur baal minto mein saaf.

- 8000Pa suction
- Cordless, USB rechargeable
- Washable HEPA filter
- 3 nozzles included`,
    features: ["8000Pa suction", "Cordless rechargeable", "Washable HEPA filter", "3 nozzles"],
    specs: [["Suction", "8000Pa"], ["Battery", "2000mAh, 25 min"], ["Weight", "550g"]],
    supplier: sup.local,
  },
  {
    name: "Magnetic Car Phone Holder 360°",
    slug: "magnetic-car-phone-holder",
    category: "car-mounts",
    kind: "carholder",
    bg: ["#ccfbf1", "#5eead4"],
    price: 899, comparePrice: 1499, costPrice: 380, badge: "Best Seller", rating: 4.5, reviews: 264, sold: 1750,
    short: "Strong N52 magnets, 360° rotation, AC vent clip — navigation ke liye phone steady.",
    description: `Ek haath se phone lagayein, ek haath se utarein.

- Strong N52 magnets
- 360° rotation
- Vent clip — dashboard pe nishaan nahi
- Har phone ke sath metal plates`,
    features: ["N52 strong magnets", "360° rotation", "Vent clip mount", "Metal plates included"],
    specs: [["Mount", "AC vent clip"], ["Rotation", "360°"], ["Compatibility", "All phones"]],
    supplier: sup.khi,
  },

  // ── Lights
  {
    name: "RGB LED Strip Lights 5m with Remote",
    slug: "rgb-led-strip-lights-5m",
    category: "decor-lights",
    kind: "ledstrip",
    bg: ["#f5f3ff", "#e9d5ff"],
    price: 1499, comparePrice: 2499, costPrice: 650, badge: "Hot", featured: true, rating: 4.5, reviews: 302, sold: 2050,
    short: "16 million colors, music sync, remote + app control — room, TV aur party decor.",
    description: `Apne room ka mood badlein!

- 5 meter strip, 150 LEDs
- 16 million colors
- Music sync mode
- Remote + mobile app control
- Self-adhesive back`,
    features: ["5m, 150 LEDs", "16M colors", "Music sync", "Remote & app control", "Self-adhesive"],
    specs: [["Length", "5m"], ["LEDs", "150 (5050 SMD)"], ["Power", "USB 5V / adapter"], ["Control", "IR remote + app"]],
    supplier: sup.khi,
  },
  {
    name: "3D Moon Lamp – 16 Colors, Touch Control",
    slug: "3d-moon-lamp",
    category: "decor-lights",
    kind: "moonlamp",
    bg: ["#1e1b4b", "#312e81"],
    price: 1999, comparePrice: 2999, costPrice: 950, rating: 4.7, reviews: 146, sold: 690,
    short: "Asli chaand jaisa 3D printed lamp, 16 colors, touch & remote — best gift idea.",
    description: `Room mein chaand le aayein!

- 3D printed real moon texture
- 16 colors + warm white
- Touch & remote control
- Wooden stand included
- Rechargeable`,
    features: ["3D printed moon texture", "16 colors", "Touch & remote control", "Wooden stand", "Rechargeable"],
    specs: [["Size", "15cm diameter"], ["Battery", "Rechargeable, 8–10 hours"], ["Charging", "USB"]],
    supplier: sup.ali,
  },
  {
    name: "Smart WiFi LED Bulb 12W (App + Voice)",
    slug: "smart-wifi-led-bulb",
    category: "smart-lighting",
    kind: "smartbulb",
    bg: ["#ecfeff", "#a5f3fc"],
    price: 1299, comparePrice: 1999, costPrice: 620, rating: 4.4, reviews: 88, sold: 470,
    short: "Phone se on/off, 16M colors, schedules, Alexa & Google Assistant support.",
    description: `Bulb ko phone se control karein — ghar ho ya bahar.

- 12W bright LED (E27)
- 16 million colors + tunable white
- Timer aur schedules
- Alexa & Google Assistant`,
    features: ["App & voice control", "16M colors", "Schedules & timers", "No hub needed"],
    specs: [["Power", "12W"], ["Base", "E27"], ["Connectivity", "WiFi 2.4GHz"], ["Life", "25,000 hours"]],
    supplier: sup.ali,
  },
  {
    name: "Rechargeable LED Desk Lamp – Touch Dimmer",
    slug: "rechargeable-led-desk-lamp",
    category: "smart-lighting",
    kind: "desklamp",
    bg: ["#fffbeb", "#fde68a"],
    price: 1899, comparePrice: 2899, costPrice: 950, featured: true, rating: 4.6, reviews: 124, sold: 610,
    short: "3 color modes, touch dimmer, 8 ghante battery — parhai aur load shedding ke liye.",
    description: `Load shedding mein bhi parhai na ruke.

- 3 color modes (warm, natural, cool)
- Stepless touch dimming
- 2400mAh battery, 8 ghante tak
- Eye-care flicker-free LEDs`,
    features: ["3 color temperatures", "Touch dimmer", "8 hours battery", "Flicker-free"],
    specs: [["Battery", "2400mAh"], ["Runtime", "Up to 8 hours"], ["Charging", "USB Type-C"]],
    supplier: sup.local,
  },
  {
    name: "Solar Wall Light with Motion Sensor",
    slug: "solar-wall-light-motion-sensor",
    category: "solar-lights",
    kind: "solarlight",
    bg: ["#fef9c3", "#fde047"],
    price: 1599, comparePrice: 2499, costPrice: 750, badge: "Best Seller", rating: 4.5, reviews: 197, sold: 1100,
    short: "Bijli ka bill zero — din mein charge, raat ko motion pe roshni. Waterproof IP65.",
    description: `Ghar ke bahar, gate, garage aur garden ke liye.

- Solar panel — koi wiring nahi
- PIR motion sensor (5–8m)
- 3 lighting modes
- IP65 waterproof`,
    features: ["Solar powered — no wiring", "Motion sensor", "3 lighting modes", "IP65 waterproof"],
    specs: [["LEDs", "100"], ["Battery", "1800mAh"], ["Sensor Range", "5–8m"], ["Waterproof", "IP65"]],
    supplier: sup.khi,
  },
];
