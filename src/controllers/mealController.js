const Meal = require('../models/Meal');
const MealCategory = require('../models/MealCategory');
const Kitchen = require('../models/Kitchen');
const Vendor = require('../models/Vendor');

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createUniqueSlug = async (value, excludeId = null) => {
  const baseSlug = buildSlug(value);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Meal.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existing) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

const getVendorForUser = async (userId) => Vendor.findOne({ user: userId });

const populateMealQuery = (query) =>
  query
    .populate({
      path: 'vendor',
      populate: {
        path: 'user',
        select: 'name email phoneNumber role',
      },
    })
    .populate('kitchen')
    .populate('category');

const ensureVendorOwnership = (vendor, user) => {
  if (user.role === 'admin') {
    return true;
  }

  return vendor.user.toString() === user.id;
};

const normalizeVariants = (variants = []) =>
  variants.map((variant, index) => ({
    name: variant.name,
    price: Number(variant.price),
    discountPrice:
      variant.discountPrice === null || variant.discountPrice === undefined
        ? null
        : Number(variant.discountPrice),
    servingLabel: variant.servingLabel || '',
    isDefault: variant.isDefault === true || (index === 0 && !variants.some((item) => item.isDefault)),
    isAvailable: variant.isAvailable !== undefined ? variant.isAvailable : true,
  }));

const deriveBasePricing = (body) => {
  if (Array.isArray(body.variants) && body.variants.length > 0) {
    const normalizedVariants = normalizeVariants(body.variants);
    const defaultVariant =
      normalizedVariants.find((variant) => variant.isDefault) || normalizedVariants[0];

    return {
      price: Number(defaultVariant.price),
      discountPrice:
        defaultVariant.discountPrice === undefined ? null : defaultVariant.discountPrice,
      variants: normalizedVariants,
    };
  }

  return {
    price: Number(body.price),
    discountPrice:
      body.discountPrice === undefined || body.discountPrice === null
        ? null
        : Number(body.discountPrice),
    variants: [],
  };
};

// @desc    Create meal
// @route   POST /api/meals
// @access  Private (Vendor/Admin)
exports.createMeal = async (req, res, next) => {
  try {
    const vendorProfile = await getVendorForUser(req.user.id);
    const vendorId = req.body.vendor || (vendorProfile && vendorProfile._id);

    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor is required' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!ensureVendorOwnership(vendor, req.user)) {
      return res.status(403).json({ message: 'Not authorized to create meals for this vendor' });
    }

    const category = await MealCategory.findById(req.body.category);
    if (!category) {
      return res.status(404).json({ message: 'Meal category not found' });
    }

    let kitchen = null;
    if (req.body.kitchen) {
      kitchen = await Kitchen.findById(req.body.kitchen).populate('vendor');
      if (!kitchen) {
        return res.status(404).json({ message: 'Kitchen not found' });
      }

      if (kitchen.vendor._id.toString() !== vendor._id.toString()) {
        return res.status(400).json({ message: 'Kitchen does not belong to the selected vendor' });
      }
    }

    const { price, discountPrice, variants } = deriveBasePricing(req.body);

    if (discountPrice !== null && discountPrice > price) {
      return res.status(400).json({ message: 'Discount price cannot be greater than meal price' });
    }

    const dailyStock = Number(
      (req.body.availability && req.body.availability.dailyStock) || 0
    );

    const meal = await Meal.create({
      vendor: vendor._id,
      kitchen: kitchen ? kitchen._id : null,
      category: category._id,
      name: req.body.name,
      slug: await createUniqueSlug(req.body.name),
      description: req.body.description,
      price,
      discountPrice,
      prepTimeMinutes: req.body.prepTimeMinutes,
      dietaryTags: req.body.dietaryTags || [],
      allergenTags: req.body.allergenTags || [],
      spiceLevel: req.body.spiceLevel || 'mild',
      visibility: req.body.visibility || 'draft',
      availability: {
        isAvailable:
          req.body.availability && req.body.availability.isAvailable !== undefined
            ? req.body.availability.isAvailable
            : true,
        dailyStock,
        remainingStock:
          req.body.availability && req.body.availability.remainingStock !== undefined
            ? req.body.availability.remainingStock
            : dailyStock,
        availableFrom:
          (req.body.availability && req.body.availability.availableFrom) || '',
        availableUntil:
          (req.body.availability && req.body.availability.availableUntil) || '',
        blackoutDates:
          (req.body.availability && req.body.availability.blackoutDates) || [],
      },
      variants,
      images: req.body.images || [],
    });

    const populatedMeal = await populateMealQuery(Meal.findById(meal._id));
    return res.status(201).json({ success: true, data: await populatedMeal });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get meals
// @route   GET /api/meals
// @access  Public
exports.getMeals = async (req, res, next) => {
  try {
    const {
      search,
      vendor,
      kitchen,
      category,
      dietaryTag,
      isAvailable,
      minPrice,
      maxPrice,
      sort,
      lat,
      lng,
      radiusKm,
    } = req.query;

    const filter = {
      visibility: 'published',
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (vendor) filter.vendor = vendor;
    if (kitchen) filter.kitchen = kitchen;
    if (category) filter.category = category;
    if (dietaryTag) filter.dietaryTags = dietaryTag;
    if (isAvailable !== undefined) filter['availability.isAvailable'] = isAvailable === 'true';

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'popularity') sortOption = { orderCount: -1, averageRating: -1 };

    let meals = await populateMealQuery(Meal.find(filter).sort(sortOption));
    meals = await meals;

    const hasGeoSearch =
      lat !== undefined && lng !== undefined && radiusKm !== undefined;

    if (hasGeoSearch) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      const maxRadiusKm = Number(radiusKm);

      meals = meals
        .map((meal) => {
          const locationAddress =
            (meal.kitchen && meal.kitchen.address) || (meal.vendor && meal.vendor.address);
          const vendorLat = locationAddress && locationAddress.lat;
          const vendorLng = locationAddress && locationAddress.lng;

          if (typeof vendorLat !== 'number' || typeof vendorLng !== 'number') {
            return null;
          }

          const distanceKm = calculateDistanceKm(
            latitude,
            longitude,
            vendorLat,
            vendorLng
          );

          if (distanceKm > maxRadiusKm) {
            return null;
          }

          const mealObject = meal.toObject();
          mealObject.distanceKm = Number(distanceKm.toFixed(2));
          return mealObject;
        })
        .filter(Boolean);
    }

    if (sort === 'distance' && hasGeoSearch) {
      meals.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get meal by id
// @route   GET /api/meals/:id
// @access  Public
exports.getMealById = async (req, res, next) => {
  try {
    const meal = await populateMealQuery(Meal.findById(req.params.id));

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    return res.status(200).json({ success: true, data: await meal });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update meal
// @route   PATCH /api/meals/:id
// @access  Private (Owner/Admin)
exports.updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('vendor');

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (!ensureVendorOwnership(meal.vendor, req.user)) {
      return res.status(403).json({ message: 'Not authorized to update this meal' });
    }

    if (req.body.category) {
      const category = await MealCategory.findById(req.body.category);
      if (!category) {
        return res.status(404).json({ message: 'Meal category not found' });
      }
      meal.category = category._id;
    }

    if (req.body.kitchen) {
      const kitchen = await Kitchen.findById(req.body.kitchen).populate('vendor');
      if (!kitchen) {
        return res.status(404).json({ message: 'Kitchen not found' });
      }

      if (kitchen.vendor._id.toString() !== meal.vendor._id.toString()) {
        return res.status(400).json({ message: 'Kitchen does not belong to the meal vendor' });
      }
      meal.kitchen = kitchen._id;
    }

    if (req.body.name && req.body.name !== meal.name) {
      meal.slug = await createUniqueSlug(req.body.name, meal._id);
      meal.name = req.body.name;
    }

    const updateFields = [
      'description',
      'price',
      'discountPrice',
      'prepTimeMinutes',
      'dietaryTags',
      'allergenTags',
      'spiceLevel',
      'visibility',
      'averageRating',
      'totalReviews',
      'orderCount',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        meal[field] = req.body[field];
      }
    });

    if (req.body.variants !== undefined) {
      const pricing = deriveBasePricing(req.body);
      meal.price = pricing.price;
      meal.discountPrice = pricing.discountPrice;
      meal.variants = pricing.variants;
    }

    if (meal.discountPrice && Number(meal.discountPrice) > Number(meal.price)) {
      return res.status(400).json({ message: 'Discount price cannot be greater than meal price' });
    }

    if (req.body.availability) {
      meal.availability = {
        ...meal.availability.toObject(),
        ...req.body.availability,
      };
    }

    if (req.body.images) {
      meal.images = req.body.images;
    }

    await meal.save();

    const populatedMeal = await populateMealQuery(Meal.findById(meal._id));
    return res.status(200).json({ success: true, data: await populatedMeal });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private (Owner/Admin)
exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('vendor');

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (!ensureVendorOwnership(meal.vendor, req.user)) {
      return res.status(403).json({ message: 'Not authorized to delete this meal' });
    }

    await meal.deleteOne();
    return res.status(200).json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get meal categories
// @route   GET /api/meals/categories
// @access  Public
exports.getMealCategories = async (_req, res, next) => {
  try {
    const categories = await MealCategory.find({ isActive: true }).sort({
      sortOrder: 1,
      name: 1,
    });

    return res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    return next(error);
  }
};

// @desc    Create meal category
// @route   POST /api/meals/categories
// @access  Private (Admin)
exports.createMealCategory = async (req, res, next) => {
  try {
    const baseSlug = buildSlug(req.body.name);
    let slug = baseSlug;
    let counter = 1;

    while (await MealCategory.findOne({ slug })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    const category = await MealCategory.create({
      name: req.body.name,
      slug,
      description: req.body.description,
      icon: req.body.icon,
      sortOrder: req.body.sortOrder,
      isActive: req.body.isActive,
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update meal category
// @route   PATCH /api/meals/categories/:id
// @access  Private (Admin)
exports.updateMealCategory = async (req, res, next) => {
  try {
    const category = await MealCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Meal category not found' });
    }

    if (req.body.name && req.body.name !== category.name) {
      category.slug = buildSlug(req.body.name);
      category.name = req.body.name;
    }

    ['description', 'icon', 'sortOrder', 'isActive'].forEach((field) => {
      if (req.body[field] !== undefined) {
        category[field] = req.body[field];
      }
    });

    await category.save();
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete meal category
// @route   DELETE /api/meals/categories/:id
// @access  Private (Admin)
exports.deleteMealCategory = async (req, res, next) => {
  try {
    const category = await MealCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Meal category not found' });
    }

    await category.deleteOne();
    return res.status(200).json({ success: true, message: 'Meal category deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get meal availability
// @route   GET /api/meals/:id/availability
// @access  Public
exports.getMealAvailability = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).select('name availability');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        mealId: meal._id,
        mealName: meal.name,
        ...meal.availability.toObject(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update meal availability
// @route   PATCH /api/meals/:id/availability
// @access  Private (Owner/Admin)
exports.updateMealAvailability = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('vendor');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (!ensureVendorOwnership(meal.vendor, req.user)) {
      return res.status(403).json({ message: 'Not authorized to update this meal availability' });
    }

    meal.availability = {
      ...meal.availability.toObject(),
      ...req.body,
    };

    await meal.save();
    return res.status(200).json({ success: true, data: meal.availability });
  } catch (error) {
    return next(error);
  }
};

// @desc    Add meal image
// @route   POST /api/meals/:id/images
// @access  Private (Owner/Admin)
exports.addMealImage = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('vendor');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (!ensureVendorOwnership(meal.vendor, req.user)) {
      return res.status(403).json({ message: 'Not authorized to update this meal images' });
    }

    if (req.body.isCover) {
      meal.images = meal.images.map((image) => ({
        ...image.toObject(),
        isCover: false,
      }));
    }

    meal.images.push({
      imageUrl: req.body.imageUrl,
      altText: req.body.altText,
      isCover: req.body.isCover || false,
    });

    await meal.save();
    return res.status(201).json({ success: true, data: meal.images[meal.images.length - 1] });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get meal images
// @route   GET /api/meals/:id/images
// @access  Public
exports.getMealImages = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).select('name images');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    return res.status(200).json({ success: true, count: meal.images.length, data: meal.images });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update meal image
// @route   PATCH /api/meals/:id/images/:imageId
// @access  Private (Owner/Admin)
exports.updateMealImage = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('vendor');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (!ensureVendorOwnership(meal.vendor, req.user)) {
      return res.status(403).json({ message: 'Not authorized to update this meal image' });
    }

    const image = meal.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Meal image not found' });
    }

    if (req.body.isCover) {
      meal.images.forEach((item) => {
        item.isCover = false;
      });
    }

    ['imageUrl', 'altText', 'isCover'].forEach((field) => {
      if (req.body[field] !== undefined) {
        image[field] = req.body[field];
      }
    });

    await meal.save();
    return res.status(200).json({ success: true, data: image });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete meal image
// @route   DELETE /api/meals/:id/images/:imageId
// @access  Private (Owner/Admin)
exports.deleteMealImage = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('vendor');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    if (!ensureVendorOwnership(meal.vendor, req.user)) {
      return res.status(403).json({ message: 'Not authorized to delete this meal image' });
    }

    const image = meal.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Meal image not found' });
    }

    image.deleteOne();
    await meal.save();
    return res.status(200).json({ success: true, message: 'Meal image deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get popular meals
// @route   GET /api/meals/popular
// @access  Public
exports.getPopularMeals = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const meals = await populateMealQuery(
      Meal.find({ visibility: 'published' })
        .sort({ orderCount: -1, averageRating: -1 })
        .limit(limit)
    );

    return res.status(200).json({ success: true, count: meals.length, data: await meals });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get recommended meals
// @route   GET /api/meals/recommended
// @access  Public
exports.getRecommendedMeals = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const filter = { visibility: 'published', 'availability.isAvailable': true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.dietaryTag) {
      filter.dietaryTags = req.query.dietaryTag;
    }

    const meals = await populateMealQuery(
      Meal.find(filter)
        .sort({ averageRating: -1, orderCount: -1, createdAt: -1 })
        .limit(limit)
    );

    return res.status(200).json({ success: true, count: meals.length, data: await meals });
  } catch (error) {
    return next(error);
  }
};
