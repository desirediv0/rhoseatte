// Default notes configuration if DB is empty
const DEFAULT_NOTES = {
  base: [
    { id: "b1", category: "Woody", name: "Mysore Sandalwood", description: "Rich, creamy, warm woody accord", color: "#8B5A2B", image: "/hero-slide-2.jpg" },
    { id: "b2", category: "Woody", name: "Atlas Cedarwood", description: "Dry, aromatic cedar with earthy undertones", color: "#A0522D", image: "/about-philosophy.jpg" },
    { id: "b3", category: "Amber", name: "Golden Amber", description: "Sweet, resinous, glowing warmth", color: "#D2691E", image: "/bestseller_banner.png" },
    { id: "b4", category: "Amber", name: "Spiced Resin", description: "Deep balsamic amber infused with clove", color: "#CD853F", image: "/trending_banner.png" },
    { id: "b5", category: "Musky", name: "White Musk", description: "Clean, velvety, skin-like softness", color: "#E6D7FF", image: "/velvet-allure.jpg" },
    { id: "b6", category: "Musky", name: "Noir Musk", description: "Intense, sensual, dark musk note", color: "#9370DB", image: "/noir-petals.jpg" },
    { id: "b7", category: "Leathery", name: "Smoked Suede", description: "Supple, soft leather accord", color: "#704214", image: "/about-cta.jpg" },
    { id: "b8", category: "Leathery", name: "Tuscan Leather", description: "Rich, opulent, smoky leather", color: "#4A2478", image: "/hero-mobile.jpg" }
  ],
  heart: [
    { id: "h1", category: "Floral", name: "Rose De Mai", description: "Lush French centifolia rose petal extract", color: "#E65C8B", image: "/noir-petals.jpg" },
    { id: "h2", category: "Floral", name: "Night Jasmine", description: "Intoxicating white floral bouquet", color: "#F0E6FF", image: "/velvet-allure.jpg" },
    { id: "h3", category: "Spicy", name: "Royal Cardamom", description: "Warm, aromatic, sweet spice accord", color: "#C79C5E", image: "/trending_banner.png" },
    { id: "h4", category: "Spicy", name: "Pink Pepper", description: "Vibrant, rosy, sparkling spice", color: "#DB7093", image: "/latest_banner.png" },
    { id: "h5", category: "Fruity", name: "Wild Fig", description: "Juicy, green, Mediterranean fig leaf", color: "#6B8E23", image: "/bestseller_banner.png" },
    { id: "h6", category: "Fruity", name: "Blackcurrant", description: "Tart, rich berry notes", color: "#4B0082", image: "/about-[#F3EAFC].jpg" },
    { id: "h7", category: "Fresh", name: "Ocean Vetiver", description: "Clean, earthy, aquatic grass accord", color: "#2E8B57", image: "/category-banner.jpg" },
    { id: "h8", category: "Fresh", name: "French Lavender", description: "Calming herbal lavender blossoms", color: "#9B72CF", image: "/rhoseatte_lavender_perfume.png" }
  ],
  top: [
    { id: "t1", category: "Citrus", name: "Calabrian Bergamot", description: "Zesty, sun-ripened Italian citrus", color: "#FFD700", image: "/banner-background.jpg" },
    { id: "t2", category: "Citrus", name: "Sicilian Mandarin", description: "Sweet, sparkling orange essence", color: "#FFA500", image: "/banner-1.svg" },
    { id: "t3", category: "Green", name: "Crisp Green Tea", description: "Refreshing, herbaceous green leaf", color: "#9ACD32", image: "/category-banner.jpg" },
    { id: "t4", category: "Green", name: "Neroli Blossom", description: "Bitter orange flower accord", color: "#F4A460", image: "/velvet-allure.jpg" },
    { id: "t5", category: "Aquatic", name: "Marine Mist", description: "Fresh ocean breeze & sea salt notes", color: "#00CED1", image: "/contact-hero.jpg" },
    { id: "t6", category: "Aquatic", name: "Dewy Lotus", description: "Pure aquatic water lily", color: "#E0FFFF", image: "/hero-desktop-1.png" },
    { id: "t7", category: "Aromatic", name: "Clary Sage", description: "Herbal, amber-tinted sage leaf", color: "#8FBC8F", image: "/journal-1.jpg" },
    { id: "t8", category: "Aromatic", name: "Eucalyptus & Mint", description: "Invigorating, crisp herbal lift", color: "#3CB371", image: "/journal-2.jpg" }
  ],
  bottles: [
    { id: "bot1", name: "Classic Heritage", capacity: "100 ml", image: "/rhoseatte_lavender_perfume.png", price: 3999, description: "Timeless faceted crystal flacon with gold stopper" },
    { id: "bot2", name: "Minimal Executive", capacity: "100 ml", image: "/hero-slide-2.jpg", price: 4299, description: "Sleek cylindrical heavy-glass bottle with magnetic cap" },
    { id: "bot3", name: "Luxury Signature", capacity: "100 ml", image: "/rhoseatte_gifting_box.png", price: 4599, description: "Hand-polished smoked glass flacon with engraved neck" },
    { id: "bot4", name: "Artisan Gold", capacity: "100 ml", image: "/about-philosophy.jpg", price: 4999, description: "Limited atelier gold-finished luxury bottle" }
  ]
};

// GET /api/public/custom-perfume/options
export const getCustomPerfumeOptions = async (req, res) => {
  try {
    // Return curated options for custom perfume creation
    res.json({
      success: true,
      data: DEFAULT_NOTES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch custom perfume options",
      error: error.message
    });
  }
};
