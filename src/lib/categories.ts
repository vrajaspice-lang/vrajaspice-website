export const CATEGORIES = [
  "All",
  "Ekadashi",
  "Everyday Sabji & Curry Masalas",
  "Temple & Satvik Prasadam Masalas",
  "Continental Herb Blends",
  "Herb & Spice Sprinkle Mixes",
  "Rice & Pulao Masalas",
  "Breakfast & Tiffin Masalas",
  "Snack & Sprinkle Seasonings",
  "Classic Indian Masalas",
  "Health, Podi & Instant Mixes",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_METADATA: Record<string, { image: string; desc: string }> = {
  "Everyday Sabji & Curry Masalas": {
    image: "/product-images/cat-everyday-masalas.png?v=2",
    desc: "Essential spices for your daily subzis, curries, and dals.",
  },
  "Temple & Satvik Prasadam Masalas": {
    image: "/product-images/cat-temple-satvik.png?v=2",
    desc: "Pure satvik masalas crafted for holy offerings and temple cooking.",
  },
  "Continental Herb Blends": {
    image: "/product-images/cat-continental-herbs.png?v=2",
    desc: "Premium dried herbs for Italian and Mediterranean dishes.",
  },
  "Herb & Spice Sprinkle Mixes": {
    image: "/product-images/cat-spice-sprinkles.png?v=2",
    desc: "Fragrant, hand-crafted sprinkles for pastas, paneer, and toasts.",
  },
  "Rice & Pulao Masalas": {
    image: "/product-images/cat-rice-pulao.png?v=2",
    desc: "Royal blends for biryanis, pulaos, and traditional rice varieties.",
  },
  "Breakfast & Tiffin Masalas": {
    image: "/product-images/cat-breakfast-tiffin.png?v=2",
    desc: "Quick, aromatic seasonings for pohas, upmas, idlis, and breakfasts.",
  },
  "Snack & Sprinkle Seasonings": {
    image: "/product-images/cat-snack-seasonings.png?v=2",
    desc: "Zesty sprinkles for popcorn, makhanas, salads, and healthy snacks.",
  },
  "Classic Indian Masalas": {
    image: "/product-images/cat-classic-indian.png?v=2",
    desc: "Authentic, traditional recipes for Garam Masala, Sambar, and Chole.",
  },
  "Health, Podi & Instant Mixes": {
    image: "/product-images/cat-health-podi.png?v=2",
    desc: "Nutritious podis, instant food, and healthy millet mixes.",
  },
  "Ekadashi": {
    image: "/product-images/cat-ekadashi.png?v=3",
    desc: "Pure grain-free, satvik ingredients specially for holy fasting days like Ekadashi.",
  },
};
