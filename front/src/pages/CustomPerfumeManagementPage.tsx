import { useState } from "react";
import { Plus, FlaskConical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FragranceNote {
  id: string;
  category: string;
  name: string;
  description: string;
  color: string;
  image: string;
}

interface BottleOption {
  id: string;
  name: string;
  capacity: string;
  price: number;
  description: string;
  image: string;
}

export default function CustomPerfumeManagementPage() {
  const [activeTab, setActiveTab] = useState<"base" | "heart" | "top" | "bottles">("base");
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Woody");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#8B5A2B");
  const [price, setPrice] = useState("3999");
  const [image] = useState("/hero-slide-2.jpg");

  // Sample State Data
  const [baseNotes, setBaseNotes] = useState<FragranceNote[]>([
    { id: "b1", category: "Woody", name: "Mysore Sandalwood", description: "Rich, creamy, warm sandalwood", color: "#8B5A2B", image: "/hero-slide-2.jpg" },
    { id: "b2", category: "Woody", name: "Atlas Cedarwood", description: "Dry aromatic cedar with earthy undertones", color: "#A0522D", image: "/about-philosophy.jpg" },
    { id: "b3", category: "Amber", name: "Golden Amber", description: "Sweet resinous glowing warmth", color: "#D2691E", image: "/bestseller_banner.png" },
    { id: "b4", category: "Musky", name: "White Musk", description: "Clean velvety skin-like softness", color: "#E6D7FF", image: "/velvet-allure.jpg" }
  ]);

  const [heartNotes, setHeartNotes] = useState<FragranceNote[]>([
    { id: "h1", category: "Floral", name: "Rose De Mai", description: "Lush French centifolia rose petal extract", color: "#E65C8B", image: "/noir-petals.jpg" },
    { id: "h2", category: "Floral", name: "Night Jasmine", description: "Intoxicating white floral bouquet", color: "#F0E6FF", image: "/velvet-allure.jpg" },
    { id: "h3", category: "Spicy", name: "Royal Cardamom", description: "Warm aromatic sweet spice accord", color: "#C79C5E", image: "/trending_banner.png" }
  ]);

  const [topNotes, setTopNotes] = useState<FragranceNote[]>([
    { id: "t1", category: "Citrus", name: "Calabrian Bergamot", description: "Zesty sun-ripened Italian citrus", color: "#FFD700", image: "/banner-background.jpg" },
    { id: "t2", category: "Green", name: "Crisp Green Tea", description: "Refreshing herbaceous green leaf", color: "#9ACD32", image: "/category-banner.jpg" }
  ]);

  const [bottles, setBottles] = useState<BottleOption[]>([
    { id: "bot1", name: "Classic Heritage", capacity: "100 ml", price: 3999, description: "Timeless faceted crystal flacon with gold cap", image: "/rhoseatte_lavender_perfume.png" },
    { id: "bot2", name: "Minimal Executive", capacity: "100 ml", price: 4299, description: "Sleek cylindrical heavy-glass bottle", image: "/hero-slide-2.jpg" },
    { id: "bot3", name: "Luxury Signature", capacity: "100 ml", price: 4599, description: "Hand-polished smoked glass flacon", image: "/rhoseatte_gifting_box.png" }
  ]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (activeTab === "bottles") {
      const newBot: BottleOption = {
        id: Date.now().toString(),
        name,
        capacity: "100 ml",
        price: parseFloat(price) || 3999,
        description,
        image
      };
      setBottles([...bottles, newBot]);
    } else {
      const newNote: FragranceNote = {
        id: Date.now().toString(),
        category,
        name,
        description,
        color,
        image
      };
      if (activeTab === "base") setBaseNotes([...baseNotes, newNote]);
      if (activeTab === "heart") setHeartNotes([...heartNotes, newNote]);
      if (activeTab === "top") setTopNotes([...topNotes, newNote]);
    }

    setName("");
    setDescription("");
    setIsAdding(false);
  };

  const handleDeleteNote = (id: string) => {
    if (activeTab === "base") setBaseNotes(baseNotes.filter(n => n.id !== id));
    if (activeTab === "heart") setHeartNotes(heartNotes.filter(n => n.id !== id));
    if (activeTab === "top") setTopNotes(topNotes.filter(n => n.id !== id));
    if (activeTab === "bottles") setBottles(bottles.filter(b => b.id !== id));
  };

  const currentNotes = 
    activeTab === "base" ? baseNotes :
    activeTab === "heart" ? heartNotes :
    activeTab === "top" ? topNotes : [];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#2E7D32] font-semibold text-xs uppercase tracking-wider">
            <FlaskConical className="w-4 h-4" />
            Atelier Management
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Custom Fragrance Notes & Bottles</h1>
          <p className="text-sm text-slate-500">
            Configure dynamic Base, Heart, Top notes and Bottle options for the Custom Perfume Builder.
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-[#2E7D32] hover:bg-[#1b5e20] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isAdding ? "Close Form" : `Add New ${activeTab.toUpperCase()} Option`}
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        {[
          { id: "base", label: "Base Notes (Layer 1)" },
          { id: "heart", label: "Heart Notes (Layer 2)" },
          { id: "top", label: "Top Notes (Layer 3)" },
          { id: "bottles", label: "Bottle Silhouettes" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-[#2E7D32] text-[#2E7D32]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add New Item Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Add New {activeTab.toUpperCase()} {activeTab === "bottles" ? "Bottle" : "Fragrance Note"}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Oudh or Tuscan Suede"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            {activeTab !== "bottles" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]"
                >
                  <option value="Woody">Woody</option>
                  <option value="Amber">Amber</option>
                  <option value="Musky">Musky</option>
                  <option value="Leathery">Leathery</option>
                  <option value="Floral">Floral</option>
                  <option value="Spicy">Spicy</option>
                  <option value="Fruity">Fruity</option>
                  <option value="Fresh">Fresh</option>
                  <option value="Citrus">Citrus</option>
                  <option value="Green">Green</option>
                  <option value="Aquatic">Aquatic</option>
                  <option value="Aromatic">Aromatic</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]"
                />
              </div>
            )}

            {activeTab !== "bottles" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Color Tag</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 p-1 border rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short sensory description of this note or bottle"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#2E7D32] hover:bg-[#1b5e20] text-white">Save Item</Button>
          </div>
        </form>
      )}

      {/* Display Grid */}
      {activeTab === "bottles" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {bottles.map((bottle) => (
            <div key={bottle.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 relative group">
              <div className="w-full h-40 relative rounded-lg overflow-hidden bg-slate-100 border">
                <img src={bottle.image} alt={bottle.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">{bottle.name}</h3>
                <span className="text-sm font-bold text-[#2E7D32]">₹{bottle.price}</span>
              </div>
              <p className="text-xs text-slate-500">{bottle.description}</p>
              <button
                onClick={() => handleDeleteNote(bottle.id)}
                className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 pt-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Bottle
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {currentNotes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 relative">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: note.color }} />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{note.category}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{note.name}</h4>
              <p className="text-xs text-slate-500 font-light line-clamp-2">{note.description}</p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono">ID: {note.id}</span>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 text-xs p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
