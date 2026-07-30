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

const createUniqueSlug = async (Model, value, excludeId = null) => {
  const baseSlug = buildSlug(value);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Model.findOne({
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

// @desc    Create vendor profile
// @route   POST /api/vendors
// @access  Private (Vendor/Admin)
exports.createVendor = async (req, res, next) => {
  try {
    const existingVendor = await Vendor.findOne({ user: req.user.id });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor profile already exists' });
    }

    const slug = await createUniqueSlug(Vendor, req.body.businessName);

    const vendor = await Vendor.create({
      user: req.user.id,
      businessName: req.body.businessName,
      slug,
      description: req.body.description,
      phone: req.body.phone,
      email: req.body.email,
      minimumPrepTimeMinutes: req.body.minimumPrepTimeMinutes,
      deliveryRadiusKm: req.body.deliveryRadiusKm,
      dietaryTags: req.body.dietaryTags || [],
      cuisines: req.body.cuisines || [],
      address: req.body.address || {},
      coverImage: req.body.coverImage || '',
      openingHours: req.body.openingHours || [],
    });

    const populatedVendor = await Vendor.findById(vendor._id).populate(
      'user',
      'name email phoneNumber role'
    );

    return res.status(201).json({ success: true, data: populatedVendor });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res, next) => {
  try {
    const {
      search,
      city,
      state,
      cuisine,
      dietaryTag,
      isOpenNow,
      verificationStatus,
      lat,
      lng,
      radiusKm,
      sort,
    } = req.query;

    const filter = {
      isActive: true,
      verificationStatus: verificationStatus || 'verified',
    };

    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) filter['address.city'] = new RegExp(`^${city}$`, 'i');
    if (state) filter['address.state'] = new RegExp(`^${state}$`, 'i');
    if (cuisine) filter.cuisines = cuisine;
    if (dietaryTag) filter.dietaryTags = dietaryTag;
    if (isOpenNow !== undefined) filter.isOpenNow = isOpenNow === 'true';

    let vendors = await Vendor.find(filter)
      .populate('user', 'name email phoneNumber role')
      .sort({ createdAt: -1 });

    const hasGeoSearch =
      lat !== undefined && lng !== undefined && radiusKm !== undefined;

    if (hasGeoSearch) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      const maxRadiusKm = Number(radiusKm);

      vendors = vendors
        .map((vendor) => {
          const vendorLat = vendor.address && vendor.address.lat;
          const vendorLng = vendor.address && vendor.address.lng;

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

          const vendorObject = vendor.toObject();
          vendorObject.distanceKm = Number(distanceKm.toFixed(2));
          return vendorObject;
        })
        .filter(Boolean);
    }

    if (sort === 'distance' && hasGeoSearch) {
      vendors.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'rating') {
      vendors.sort((a, b) => b.averageRating - a.averageRating);
    }

    return res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate(
      'user',
      'name email phoneNumber role'
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    return res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update vendor
// @route   PATCH /api/vendors/:id
// @access  Private (Owner/Admin)
exports.updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this vendor' });
    }

    if (req.body.businessName && req.body.businessName !== vendor.businessName) {
      vendor.slug = await createUniqueSlug(Vendor, req.body.businessName, vendor._id);
      vendor.businessName = req.body.businessName;
    }

    const updatableFields = [
      'description',
      'phone',
      'email',
      'minimumPrepTimeMinutes',
      'deliveryRadiusKm',
      'dietaryTags',
      'cuisines',
      'address',
      'coverImage',
      'openingHours',
      'isOpenNow',
      'isActive',
      'verificationStatus',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();

    const populatedVendor = await Vendor.findById(vendor._id).populate(
      'user',
      'name email phoneNumber role'
    );

    return res.status(200).json({ success: true, data: populatedVendor });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Owner/Admin)
exports.deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this vendor' });
    }

    await vendor.deleteOne();
    return res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

exports.createUniqueVendorSlug = createUniqueSlug;
