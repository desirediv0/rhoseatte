// GET /api/admin/custom-perfume/notes
export const getAdminCustomPerfumeNotes = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Custom perfume notes fetched successfully",
      data: {
        totalNotes: 24,
        categories: ["Base Notes", "Heart Notes", "Top Notes"],
        bottles: ["Classic Heritage", "Minimal Executive", "Luxury Signature", "Artisan Gold"]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/custom-perfume/notes
export const createCustomPerfumeNote = async (req, res) => {
  try {
    const { name, noteType, category, description, color, image } = req.body;
    res.json({
      success: true,
      message: `Fragrance note '${name}' added successfully to ${noteType}`,
      data: { id: Date.now().toString(), name, noteType, category, description, color, image }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/custom-perfume/bottles
export const createCustomPerfumeBottle = async (req, res) => {
  try {
    const { name, capacity, price, description, image } = req.body;
    res.json({
      success: true,
      message: `Custom bottle silhouette '${name}' added successfully`,
      data: { id: Date.now().toString(), name, capacity, price, description, image }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
