"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  IconFlask, 
  IconSparkles, 
  IconCheck, 
  IconArrowRight, 
  IconArrowLeft, 
  IconShoppingBag,
  IconClock,
  IconPackage,
  IconX,
  IconEye,
  IconChevronUp,
  IconChevronDown
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import Reveal from "@/components/ui/Reveal";

// Default notes configuration matching notebook drawing categories
const DEFAULT_NOTES = {
  base: [
    { id: "b1", category: "Woody", name: "Mysore Sandalwood", description: "Rich, creamy, warm sandalwood", color: "#8B5A2B", image: "/hero-slide-2.jpg" },
    { id: "b2", category: "Woody", name: "Atlas Cedarwood", description: "Dry, aromatic cedarwood", color: "#A0522D", image: "/about-philosophy.jpg" },
    { id: "b3", category: "Amber", name: "Golden Amber", description: "Sweet, resinous, glowing warmth", color: "#D2691E", image: "/bestseller_banner.png" },
    { id: "b4", category: "Amber", name: "Spiced Resin", description: "Deep balsamic spiced amber", color: "#CD853F", image: "/trending_banner.png" },
    { id: "b5", category: "Musky", name: "White Musk", description: "Clean, velvety, skin-like softness", color: "#E6D7FF", image: "/velvet-allure.jpg" },
    { id: "b6", category: "Musky", name: "Noir Musk", description: "Intense, sensual, dark musk", color: "#9370DB", image: "/noir-petals.jpg" },
    { id: "b7", category: "Leathery", name: "Smoked Suede", description: "Supple, soft leather accord", color: "#704214", image: "/about-cta.jpg" },
    { id: "b8", category: "Leathery", name: "Tuscan Leather", description: "Rich, opulent smoky leather", color: "#4A2478", image: "/hero-mobile.jpg" }
  ],
  heart: [
    { id: "h1", category: "Floral", name: "Rose De Mai", description: "Lush French centifolia rose", color: "#E65C8B", image: "/noir-petals.jpg" },
    { id: "h2", category: "Floral", name: "Night Jasmine", description: "Intoxicating white floral bouquet", color: "#F0E6FF", image: "/velvet-allure.jpg" },
    { id: "h3", category: "Spicy", name: "Royal Cardamom", description: "Warm, sweet spice accord", color: "#C79C5E", image: "/trending_banner.png" },
    { id: "h4", category: "Spicy", name: "Pink Pepper", description: "Vibrant, rosy, sparkling spice", color: "#DB7093", image: "/latest_banner.png" },
    { id: "h5", category: "Fruity", name: "Wild Fig", description: "Juicy green Mediterranean fig", color: "#6B8E23", image: "/bestseller_banner.png" },
    { id: "h6", category: "Fruity", name: "Blackcurrant", description: "Tart, rich berry notes", color: "#4B0082", image: "/rhoseatte_gifting_box.png" },
    { id: "h7", category: "Fresh", name: "Ocean Vetiver", description: "Clean, earthy, aquatic grass", color: "#2E8B57", image: "/category-banner.jpg" },
    { id: "h8", category: "Fresh", name: "French Lavender", description: "Calming herbal lavender blossoms", color: "#9B72CF", image: "/rhoseatte_lavender_perfume.png" }
  ],
  top: [
    { id: "t1", category: "Citrus", name: "Calabrian Bergamot", description: "Zesty sun-ripened Italian citrus", color: "#FFD700", image: "/banner-background.jpg" },
    { id: "t2", category: "Citrus", name: "Sicilian Mandarin", description: "Sweet sparkling orange essence", color: "#FFA500", image: "/banner-1.svg" },
    { id: "t3", category: "Green", name: "Crisp Green Tea", description: "Refreshing herbaceous green leaf", color: "#9ACD32", image: "/category-banner.jpg" },
    { id: "t4", category: "Green", name: "Neroli Blossom", description: "Bitter orange flower accord", color: "#F4A460", image: "/velvet-allure.jpg" },
    { id: "t5", category: "Aquatic", name: "Marine Mist", description: "Fresh ocean breeze & sea salt", color: "#00CED1", image: "/contact-hero.jpg" },
    { id: "t6", category: "Aquatic", name: "Dewy Lotus", description: "Pure aquatic water lily", color: "#E0FFFF", image: "/hero-desktop-1.png" },
    { id: "t7", category: "Aromatic", name: "Clary Sage", description: "Herbal amber-tinted sage leaf", color: "#8FBC8F", image: "/journal-1.jpg" },
    { id: "t8", category: "Aromatic", name: "Eucalyptus & Mint", description: "Invigorating crisp herbal lift", color: "#3CB371", image: "/journal-2.jpg" }
  ],
  bottles: [
    { id: "bot1", name: "Classic Heritage", capacity: "100 ml", image: "/rhoseatte_lavender_perfume.png", price: 3999, description: "Timeless faceted crystal flacon with gold cap" },
    { id: "bot2", name: "Minimal Executive", capacity: "100 ml", image: "/hero-slide-2.jpg", price: 4299, description: "Sleek cylindrical heavy-glass bottle" },
    { id: "bot3", name: "Luxury Signature", capacity: "100 ml", image: "/rhoseatte_gifting_box.png", price: 4599, description: "Hand-polished smoked glass flacon" },
    { id: "bot4", name: "Artisan Gold", capacity: "100 ml", image: "/about-philosophy.jpg", price: 4999, description: "Limited atelier gold-finished luxury bottle" }
  ]
};

export default function CustomPerfumePage() {
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(1); // 1: Intro, 2: Base, 3: Heart, 4: Top, 5: Bottle
  const [mobileBottleOpen, setMobileBottleOpen] = useState(false);

  // Selections
  const [selectedBase, setSelectedBase] = useState([]);
  const [selectedHeart, setSelectedHeart] = useState([]);
  const [selectedTop, setSelectedTop] = useState([]);
  const [selectedBottle, setSelectedBottle] = useState(DEFAULT_NOTES.bottles[0]);
  const [engraving, setEngraving] = useState("");

  // Toggle Selection Helper (Min 1, Max 3 notes)
  const toggleNote = (note, selectedList, setSelectedList) => {
    const isSelected = selectedList.some((n) => n.id === note.id);
    if (isSelected) {
      setSelectedList(selectedList.filter((n) => n.id !== note.id));
    } else {
      if (selectedList.length >= 3) {
        toast.error("You can select a maximum of 3 notes per layer.");
        return;
      }
      setSelectedList([...selectedList, note]);
    }
  };

  // Validation before next slide
  const handleNext = () => {
    if (currentSlide === 2 && selectedBase.length === 0) {
      toast.error("Please choose at least 1 Base note.");
      return;
    }
    if (currentSlide === 3 && selectedHeart.length === 0) {
      toast.error("Please choose at least 1 Heart note.");
      return;
    }
    if (currentSlide === 4 && selectedTop.length === 0) {
      toast.error("Please choose at least 1 Top note.");
      return;
    }
    if (currentSlide < 5) {
      setCurrentSlide(currentSlide + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Add to Cart Action
  const handleAddToCart = async () => {
    if (!selectedBottle) {
      toast.error("Please select a bottle silhouette.");
      return;
    }

    const customProduct = {
      id: `custom-perfume-${Date.now()}`,
      name: `Custom Bespoke Perfume (100 ml) - ${selectedBottle.name}`,
      price: selectedBottle.price,
      image: selectedBottle.image,
      isCustom: true,
      customDetails: {
        baseNotes: selectedBase.map((n) => n.name).join(", "),
        heartNotes: selectedHeart.map((n) => n.name).join(", "),
        topNotes: selectedTop.map((n) => n.name).join(", "),
        bottleName: selectedBottle.name,
        engraving: engraving.trim() || "N/A"
      }
    };

    try {
      await addToCart(customProduct, 1);
      toast.success("Bespoke Perfume Package added to cart!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  // Calculate Liquid Fill Percentage & Gradient
  const fillPercentage = 
    currentSlide === 1 ? 0 :
    currentSlide === 2 ? (selectedBase.length > 0 ? 33 : 10) :
    currentSlide === 3 ? (selectedHeart.length > 0 ? 66 : 40) :
    (selectedTop.length > 0 ? 100 : 75);

  return (
    <main className="bg-[#FAF7FD] min-h-screen text-noir pt-24 pb-24 font-sans selection:bg-gold/20">
      
      {/* ── SLIDE 1: INTRO LANDING PAGE ── */}
      {currentSlide === 1 && (
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-10 space-y-12">
          
          {/* Header Banner */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#B8976A]/40 bg-white/90 backdrop-blur-md rounded-full text-[#7048A0] text-xs uppercase tracking-[0.25em] font-semibold shadow-sm">
              <IconFlask className="w-4 h-4 text-[#B8976A]" />
              Atelier Bespoke Creation
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#240E42] tracking-tight leading-tight">
              Customised <em className="italic text-[#6533A3]">Fragrance</em>
            </h1>
            <p className="text-[#5C457A] text-base sm:text-lg font-light leading-relaxed">
              Design a 100 ml bespoke perfume crafted specifically for your unique scent identity.
            </p>
            <div className="w-16 h-px bg-[#B8976A] mx-auto pt-2" />
          </div>

          {/* Process Timeline & Bullet Points Requested */}
          <div className="bg-white/90 backdrop-blur-sm border border-[#E4D5F8] rounded-3xl p-6 sm:p-12 space-y-8 shadow-xl">
            <h2 className="font-display text-2xl sm:text-3xl text-[#240E42] text-center mb-6">How Bespoke Creation Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Bullet 1 */}
              <div className="flex items-start gap-4 p-5 bg-[#FAF6FF] rounded-2xl border border-[#ECE0FA]">
                <div className="w-10 h-10 rounded-full bg-[#4A2478] text-white flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#240E42] font-semibold">Create Your Fragrance</h3>
                  <p className="text-xs sm:text-sm text-[#5C4D73] leading-relaxed font-light">
                    Select your preferred <strong className="text-[#240E42] font-semibold">Base, Heart, and Top Notes</strong> to design a perfume that&apos;s uniquely yours.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-4 p-5 bg-[#FAF6FF] rounded-2xl border border-[#ECE0FA]">
                <div className="w-10 h-10 rounded-full bg-[#4A2478] text-white flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#240E42] font-semibold">We Craft 3 Samples</h3>
                  <p className="text-xs sm:text-sm text-[#5C4D73] leading-relaxed font-light">
                    Our perfumers will create <strong className="text-[#240E42] font-semibold">three personalised fragrance variations</strong>, each labelled with a unique code based on your selected notes.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-4 p-5 bg-[#FAF6FF] rounded-2xl border border-[#ECE0FA]">
                <div className="w-10 h-10 rounded-full bg-[#4A2478] text-white flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#240E42] font-semibold">Try & Choose</h3>
                  <p className="text-xs sm:text-sm text-[#5C4D73] leading-relaxed font-light">
                    Test all three samples and simply reply to our email with the code of your favourite fragrance.
                  </p>
                </div>
              </div>

              {/* Bullet 4 */}
              <div className="flex items-start gap-4 p-5 bg-[#FAF6FF] rounded-2xl border border-[#ECE0FA]">
                <div className="w-10 h-10 rounded-full bg-[#4A2478] text-white flex items-center justify-center shrink-0 font-bold text-sm">4</div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#240E42] font-semibold">Your Final Bottle</h3>
                  <p className="text-xs sm:text-sm text-[#5C4D73] leading-relaxed font-light">
                    Once your preferred sample is confirmed, we&apos;ll handcraft your <strong className="text-[#240E42] font-semibold">100 ml personalised perfume</strong> using the exact selected formula.
                  </p>
                </div>
              </div>

            </div>

            {/* Bullet 5: Timeline Box */}
            <div className="p-6 bg-gradient-to-r from-[#F3EAFC] to-[#EBE0F8] border border-[#B8976A]/40 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#7E52BC] font-bold text-xs uppercase tracking-widest">
                <IconClock className="w-4 h-4 text-[#B8976A]" />
                <span>Estimated Creation & Delivery Timeline</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4E3966] leading-relaxed font-light">
                Sample creation takes <strong className="text-[#240E42] font-semibold">2–5 business days</strong>, followed by <strong className="text-[#240E42] font-semibold">4–5 business days</strong> for delivery. After you choose your favourite sample, your final bottle is produced within <strong className="text-[#240E42] font-semibold">1–2 business days</strong> and shipped. The entire process, from creating your fragrance to receiving your custom 100 ml bottle, typically takes <strong className="text-[#240E42] font-semibold">2–3 weeks</strong>.
              </p>
            </div>
          </div>

          {/* Button to get started */}
          <div className="text-center pt-4">
            <button
              onClick={() => setCurrentSlide(2)}
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#4A2478] hover:bg-[#38195E] text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-full shadow-2xl transition-all duration-300 group"
            >
              Start Customizing Your Fragrance
              <IconArrowRight className="w-4 h-4 text-[#EAD5AB] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      )}


      {/* ── SLIDES 2 to 5: INTERACTIVE FRAGRANCE BUILDER WITH LIVE BOTTLE ── */}
      {currentSlide > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4">
          
          {/* Progress Indicator Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8DAFA]">
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrevious}
                className="p-2.5 text-[#4A2478] hover:bg-[#F0E6FF] transition-colors rounded-full border border-[#D9C8F5]"
                aria-label="Previous step"
              >
                <IconArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7E52BC]">
                Step {currentSlide - 1} of 4
              </span>
            </div>

            {/* Step Pills */}
            <div className="hidden sm:flex items-center gap-2">
              {["Base Notes", "Heart Notes", "Top Notes", "Bottle Silhouette"].map((stepTitle, idx) => (
                <div 
                  key={stepTitle}
                  onClick={() => setCurrentSlide(idx + 2)}
                  className={`px-3.5 py-1.5 text-[11px] rounded-full uppercase tracking-wider cursor-pointer font-semibold transition-all ${
                    currentSlide === idx + 2
                      ? "bg-[#4A2478] text-white shadow-md"
                      : currentSlide > idx + 2
                      ? "bg-[#F0E6FF] text-[#4A2478]"
                      : "bg-white text-[#634E7D] border border-[#E8DAFA]"
                  }`}
                >
                  {stepTitle}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: INTERACTIVE NOTES SELECTION (SLIDES 2, 3, 4, 5) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              {/* ── SLIDE 2: BASE NOTES ── */}
              {currentSlide === 2 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-bold block mb-1">
                      Layer 1 — Foundation
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#240E42]">Choose Base Notes</h2>
                    <p className="text-xs sm:text-sm text-[#5C4D73] font-light mt-1.5 leading-relaxed">
                      Select minimum 1 to maximum 3 base notes. Base notes anchor the fragrance, lingering on the skin for hours with rich warmth and depth.
                    </p>
                  </div>

                  {/* Render Note Categories (Woody, Amber, Musky, Leathery) */}
                  {["Woody", "Amber", "Musky", "Leathery"].map((catName) => {
                    const categoryNotes = DEFAULT_NOTES.base.filter((n) => n.category === catName);
                    return (
                      <div key={catName} className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-[#E8DAFA] pb-2">
                          <h3 className="font-serif text-base uppercase tracking-wider text-[#3C1D68] font-semibold">
                            {catName} Accords
                          </h3>
                          <span className="text-[10px] text-[#7E52BC] uppercase tracking-widest font-bold">Choose 1–3 Notes</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {categoryNotes.map((note) => {
                            const isSelected = selectedBase.some((n) => n.id === note.id);
                            return (
                              <div
                                key={note.id}
                                onClick={() => toggleNote(note, selectedBase, setSelectedBase)}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 relative group text-center flex flex-col justify-between ${
                                  isSelected
                                    ? "border-[#B8976A] bg-white shadow-xl ring-2 ring-[#B8976A]/40 scale-[1.02]"
                                    : "border-[#E8DAFA] bg-white/90 hover:border-[#B8976A]/60 hover:bg-white hover:shadow-md"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#4A2478] text-white flex items-center justify-center text-[10px] font-bold shadow-md z-10">
                                    ✓
                                  </div>
                                )}

                                <div>
                                  <div className="w-12 h-12 rounded-2xl mx-auto mb-2.5 flex items-center justify-center border border-[#E8DAFA] overflow-hidden relative shadow-inner bg-[#FAF5FF] group-hover:scale-105 transition-transform">
                                    <Image src={note.image} alt={note.name} fill className="object-cover opacity-85" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#240E42]/40 via-transparent to-transparent" />
                                    <span className="w-3.5 h-3.5 rounded-full border border-white/80 shadow relative z-10" style={{ backgroundColor: note.color }} />
                                  </div>

                                  <h4 className="text-xs font-bold text-[#240E42] leading-snug">{note.name}</h4>
                                  <p className="text-[10px] text-[#5C4D73] mt-1 line-clamp-2 font-light">{note.description}</p>
                                </div>

                                <div className="pt-2">
                                  <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full block ${
                                    isSelected ? "bg-[#4A2478] text-white" : "bg-[#F3EAFC] text-[#5B308C]"
                                  }`}>
                                    {isSelected ? "Selected" : "Tap to Select"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── SLIDE 3: HEART NOTES ── */}
              {currentSlide === 3 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-bold block mb-1">
                      Layer 2 — Personality
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#240E42]">Choose Heart Notes</h2>
                    <p className="text-xs sm:text-sm text-[#5C4D73] font-light mt-1.5 leading-relaxed">
                      Select minimum 1 to maximum 3 heart notes. Heart notes bloom after top notes soften, providing the emotional heart of your perfume.
                    </p>
                  </div>

                  {["Floral", "Spicy", "Fruity", "Fresh"].map((catName) => {
                    const categoryNotes = DEFAULT_NOTES.heart.filter((n) => n.category === catName);
                    return (
                      <div key={catName} className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-[#E8DAFA] pb-2">
                          <h3 className="font-serif text-base uppercase tracking-wider text-[#3C1D68] font-semibold">
                            {catName} Accords
                          </h3>
                          <span className="text-[10px] text-[#7E52BC] uppercase tracking-widest font-bold">Choose 1–3 Notes</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {categoryNotes.map((note) => {
                            const isSelected = selectedHeart.some((n) => n.id === note.id);
                            return (
                              <div
                                key={note.id}
                                onClick={() => toggleNote(note, selectedHeart, setSelectedHeart)}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 relative group text-center flex flex-col justify-between ${
                                  isSelected
                                    ? "border-[#B8976A] bg-white shadow-xl ring-2 ring-[#B8976A]/40 scale-[1.02]"
                                    : "border-[#E8DAFA] bg-white/90 hover:border-[#B8976A]/60 hover:bg-white hover:shadow-md"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#4A2478] text-white flex items-center justify-center text-[10px] font-bold shadow-md z-10">
                                    ✓
                                  </div>
                                )}

                                <div>
                                  <div className="w-12 h-12 rounded-2xl mx-auto mb-2.5 flex items-center justify-center border border-[#E8DAFA] overflow-hidden relative shadow-inner bg-[#FAF5FF] group-hover:scale-105 transition-transform">
                                    <Image src={note.image} alt={note.name} fill className="object-cover opacity-85" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#240E42]/40 via-transparent to-transparent" />
                                    <span className="w-3.5 h-3.5 rounded-full border border-white/80 shadow relative z-10" style={{ backgroundColor: note.color }} />
                                  </div>

                                  <h4 className="text-xs font-bold text-[#240E42] leading-snug">{note.name}</h4>
                                  <p className="text-[10px] text-[#5C4D73] mt-1 line-clamp-2 font-light">{note.description}</p>
                                </div>

                                <div className="pt-2">
                                  <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full block ${
                                    isSelected ? "bg-[#4A2478] text-white" : "bg-[#F3EAFC] text-[#5B308C]"
                                  }`}>
                                    {isSelected ? "Selected" : "Tap to Select"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── SLIDE 4: TOP NOTES ── */}
              {currentSlide === 4 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-bold block mb-1">
                      Layer 3 — First Impression
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#240E42]">Choose Top Notes</h2>
                    <p className="text-xs sm:text-sm text-[#5C4D73] font-light mt-1.5 leading-relaxed">
                      Select minimum 1 to maximum 3 top notes. Top notes greet you on the first spritz, giving an immediate, vibrant burst of energy.
                    </p>
                  </div>

                  {["Citrus", "Green", "Aquatic", "Aromatic"].map((catName) => {
                    const categoryNotes = DEFAULT_NOTES.top.filter((n) => n.category === catName);
                    return (
                      <div key={catName} className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-[#E8DAFA] pb-2">
                          <h3 className="font-serif text-base uppercase tracking-wider text-[#3C1D68] font-semibold">
                            {catName} Accords
                          </h3>
                          <span className="text-[10px] text-[#7E52BC] uppercase tracking-widest font-bold">Choose 1–3 Notes</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {categoryNotes.map((note) => {
                            const isSelected = selectedTop.some((n) => n.id === note.id);
                            return (
                              <div
                                key={note.id}
                                onClick={() => toggleNote(note, selectedTop, setSelectedTop)}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 relative group text-center flex flex-col justify-between ${
                                  isSelected
                                    ? "border-[#B8976A] bg-white shadow-xl ring-2 ring-[#B8976A]/40 scale-[1.02]"
                                    : "border-[#E8DAFA] bg-white/90 hover:border-[#B8976A]/60 hover:bg-white hover:shadow-md"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#4A2478] text-white flex items-center justify-center text-[10px] font-bold shadow-md z-10">
                                    ✓
                                  </div>
                                )}

                                <div>
                                  <div className="w-12 h-12 rounded-2xl mx-auto mb-2.5 flex items-center justify-center border border-[#E8DAFA] overflow-hidden relative shadow-inner bg-[#FAF5FF] group-hover:scale-105 transition-transform">
                                    <Image src={note.image} alt={note.name} fill className="object-cover opacity-85" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#240E42]/40 via-transparent to-transparent" />
                                    <span className="w-3.5 h-3.5 rounded-full border border-white/80 shadow relative z-10" style={{ backgroundColor: note.color }} />
                                  </div>

                                  <h4 className="text-xs font-bold text-[#240E42] leading-snug">{note.name}</h4>
                                  <p className="text-[10px] text-[#5C4D73] mt-1 line-clamp-2 font-light">{note.description}</p>
                                </div>

                                <div className="pt-2">
                                  <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full block ${
                                    isSelected ? "bg-[#4A2478] text-white" : "bg-[#F3EAFC] text-[#5B308C]"
                                  }`}>
                                    {isSelected ? "Selected" : "Tap to Select"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── SLIDE 5: BOTTLE SILHOUETTE & ADD TO CART ── */}
              {currentSlide === 5 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#B8976A] font-bold block mb-1">
                      Final Step — Flacon Selection
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#240E42]">Choose Bottle Silhouette</h2>
                    <p className="text-xs sm:text-sm text-[#5C4D73] font-light mt-1.5 leading-relaxed">
                      Select your preferred 100 ml bottle design to hold your handcrafted bespoke perfume.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {DEFAULT_NOTES.bottles.map((bottle) => {
                      const isSelected = selectedBottle?.id === bottle.id;
                      return (
                        <div
                          key={bottle.id}
                          onClick={() => setSelectedBottle(bottle)}
                          className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                            isSelected
                              ? "border-[#B8976A] bg-white shadow-xl ring-2 ring-[#B8976A]/40"
                              : "border-[#E8DAFA] bg-white/90 hover:border-[#B8976A]/50"
                          }`}
                        >
                          <div className="w-20 h-24 relative rounded-2xl overflow-hidden bg-[#FAF5FF] border border-[#E8DAFA] shrink-0">
                            <Image src={bottle.image} alt={bottle.name} fill className="object-cover" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg text-[#240E42] font-semibold">{bottle.name}</h4>
                            <p className="text-xs text-[#5C4D73] font-light">{bottle.description}</p>
                            <p className="text-sm font-bold text-[#4A2478] pt-1">₹{bottle.price.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Engraving Input */}
                  <div className="p-6 border border-[#B8976A]/40 rounded-3xl bg-white shadow-md space-y-2">
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#240E42]">
                      Custom Monogram Bottle Engraving (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      value={engraving}
                      onChange={(e) => setEngraving(e.target.value)}
                      placeholder="e.g. 'VAISHNAVI POTE' or 'RHOSEATTE 2026'"
                      className="w-full px-4 py-3.5 border border-[#E8DAFA] rounded-xl text-sm text-[#240E42] bg-[#FAF8FC] focus:outline-none focus:border-[#4A2478]"
                    />
                    <p className="text-[11px] text-[#7E52BC] italic">
                      Engraved directly onto the glass shoulder of your 100 ml bottle.
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE NAVIGATION CONTROLS */}
              <div className="flex items-center justify-between pt-6 border-t border-[#E8DAFA]">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3.5 border border-[#D9C8F5] hover:bg-[#4A2478] hover:text-white text-[#4A2478] text-xs font-semibold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2"
                >
                  <IconArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentSlide < 5 ? (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3.5 bg-[#4A2478] hover:bg-[#38195E] text-white text-xs uppercase tracking-[0.15em] font-semibold rounded-full transition-colors flex items-center gap-2 shadow-xl group"
                  >
                    Next Step
                    <IconArrowRight className="w-4 h-4 text-[#EAD5AB] group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="px-8 py-4 bg-[#4A2478] hover:bg-[#38195E] text-white text-xs uppercase tracking-[0.15em] font-semibold rounded-full transition-colors flex items-center gap-2 shadow-xl"
                  >
                    <IconShoppingBag className="w-4 h-4 text-[#EAD5AB]" />
                    Add Custom Perfume to Cart (₹{selectedBottle?.price?.toLocaleString()})
                  </button>
                )}
              </div>

            </div>


            {/* RIGHT COLUMN: PERSISTENT INTERACTIVE BOTTLE PREVIEW (Desktop Sticky + Mobile Accordion) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-28">
              
              {/* Mobile Drawer Trigger (lg:hidden) */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setMobileBottleOpen(!mobileBottleOpen)}
                  className="w-full py-3 px-4 bg-[#4A2478] text-white rounded-2xl flex items-center justify-between text-xs uppercase tracking-wider font-semibold shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <IconFlask className="w-4 h-4 text-[#EAD5AB]" />
                    Live Formula Preview ({fillPercentage}% Filled)
                  </span>
                  {mobileBottleOpen ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className={`bg-white/95 backdrop-blur-md border border-[#E4D5F8] rounded-3xl p-6 shadow-2xl text-center space-y-6 ${
                mobileBottleOpen ? "block" : "hidden lg:block"
              }`}>
                
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B8976A] font-bold block">
                  Live Perfume Bottle Fill
                </span>

                {/* 3D-like Liquid Filling Bottle Graphic */}
                <div className="relative w-40 h-72 mx-auto rounded-[36px] border-4 border-[#240E42] bg-gradient-to-b from-white/90 via-white/50 to-[#FAF5FF] overflow-hidden shadow-2xl flex flex-col justify-end p-1.5 backdrop-blur-md">
                  
                  {/* Bottle Metallic Cap Top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-7 bg-gradient-to-r from-[#B8976A] via-[#EAD5AB] to-[#B8976A] border-b-2 border-[#240E42] rounded-t-lg shadow flex items-center justify-center">
                    <span className="text-[7px] text-[#240E42] font-extrabold uppercase tracking-widest">100ml</span>
                  </div>

                  {/* Engraving Preview on Glass */}
                  {engraving.trim() && (
                    <div className="absolute top-10 left-2 right-2 text-center z-20 pointer-events-none">
                      <span className="text-[9px] font-serif uppercase tracking-widest text-[#240E42] bg-white/80 px-2 py-0.5 rounded border border-[#B8976A]/40 shadow-sm block truncate">
                        &quot;{engraving.trim()}&quot;
                      </span>
                    </div>
                  )}

                  {/* Liquid Fill Level */}
                  <div 
                    className="w-full rounded-b-[28px] transition-all duration-1000 ease-out relative overflow-hidden shadow-lg"
                    style={{
                      height: `${fillPercentage}%`,
                      background: fillPercentage > 70 
                        ? "linear-gradient(to top, #8B5A2B 0%, #D2691E 30%, #E65C8B 65%, #FFD700 100%)"
                        : fillPercentage > 40
                        ? "linear-gradient(to top, #8B5A2B 0%, #E65C8B 100%)"
                        : "linear-gradient(to top, #8B5A2B 0%, #D2691E 100%)"
                    }}
                  >
                    {/* Liquid Shimmer Waves */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse pointer-events-none" />
                  </div>

                  {/* Empty state label inside bottle */}
                  {fillPercentage === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#5C4D73] uppercase tracking-wider font-bold text-center p-4">
                      Select Base Notes To Fill
                    </div>
                  )}

                  {/* Measurement Ticks */}
                  <div className="absolute left-2.5 top-12 bottom-5 flex flex-col justify-between text-[8px] text-[#240E42]/50 pointer-events-none font-mono font-bold">
                    <span>100ml</span>
                    <span>66ml</span>
                    <span>33ml</span>
                  </div>
                </div>

                {/* Formula Breakdown Summary */}
                <div className="space-y-3 text-left pt-2 border-t border-[#E8DAFA]">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#240E42] text-center">
                    Selected Formula Summary
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="font-bold text-[#3C1D68] uppercase text-[10px] tracking-wider block">Base Notes:</span>
                      <p className="text-[#5C4D73] text-[11px] font-medium mt-0.5">
                        {selectedBase.length > 0 ? selectedBase.map(n => n.name).join(", ") : "None selected yet"}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-[#3C1D68] uppercase text-[10px] tracking-wider block">Heart Notes:</span>
                      <p className="text-[#5C4D73] text-[11px] font-medium mt-0.5">
                        {selectedHeart.length > 0 ? selectedHeart.map(n => n.name).join(", ") : "None selected yet"}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-[#3C1D68] uppercase text-[10px] tracking-wider block">Top Notes:</span>
                      <p className="text-[#5C4D73] text-[11px] font-medium mt-0.5">
                        {selectedTop.length > 0 ? selectedTop.map(n => n.name).join(", ") : "None selected yet"}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-[#3C1D68] uppercase text-[10px] tracking-wider block">Bottle Silhouette:</span>
                      <p className="text-[#5C4D73] text-[11px] font-medium mt-0.5">{selectedBottle?.name || "Classic Heritage"}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
