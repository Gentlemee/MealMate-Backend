import Meal from "../models/Meal.js";

export const searchMeals = async (req, res) => {
  try {
    const { q, category, spiceLevel, dietaryTag, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
    const filter = { visibility: "published" };
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    if (category) filter.category = category;
    if (spiceLevel) filter.spiceLevel = spiceLevel;
    if (dietaryTag) filter.dietaryTags = { $regex: dietaryTag, $options: "i" };
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { averageRating: -1 };
    if (sort === "popular") sortOption = { orderCount: -1 };
    const [meals, total] = await Promise.all([
      Meal.find(filter).populate("vendor", "businessName").populate("category", "name").sort(sortOption).skip(skip).limit(limitNumber),
      Meal.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, message: "Meals retrieved successfully", count: meals.length, total, page: pageNumber, pages: Math.ceil(total / limitNumber), meals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to search meals", error: error.message });
  }
};
