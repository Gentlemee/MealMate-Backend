import Kitchen from '../models/Kitchen.js';
import Vendor from '../models/Vendor.js';

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
    const existing = await Kitchen.findOne({
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

// @desc    Create kitchen/storefront
// @route   POST /api/kitchens
// @access  Private (Vendor/Admin)
export const createKitchen = async (req, res, next) => {
  try {
    const vendor = await getVendorForUser(req.user.id);

    if (!vendor && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    const vendorId = req.body.vendor || (vendor && vendor._id);

    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor is required' });
    }

    const ownerVendor = await Vendor.findById(vendorId);
    if (!ownerVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (req.user.role !== 'admin' && ownerVendor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create kitchen for this vendor' });
    }

    const kitchen = await Kitchen.create({
      vendor: vendorId,
      name: req.body.name,
      slug: await createUniqueSlug(req.body.name),
      description: req.body.description,
      serviceModes: req.body.serviceModes || ['delivery'],
      address: req.body.address || {},
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });

    const populatedKitchen = await Kitchen.findById(kitchen._id).populate('vendor');
    return res.status(201).json({ success: true, data: populatedKitchen });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all kitchens
// @route   GET /api/kitchens
// @access  Public
export const getKitchens = async (req, res, next) => {
  try {
    const { search, city, state, vendor, serviceMode } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) filter['address.city'] = new RegExp(`^${city}$`, 'i');
    if (state) filter['address.state'] = new RegExp(`^${state}$`, 'i');
    if (vendor) filter.vendor = vendor;
    if (serviceMode) filter.serviceModes = serviceMode;

    const kitchens = await Kitchen.find(filter).populate('vendor').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: kitchens.length, data: kitchens });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update kitchen
// @route   PATCH /api/kitchens/:id
// @access  Private (Owner/Admin)
export const updateKitchen = async (req, res, next) => {
  try {
    const kitchen = await Kitchen.findById(req.params.id).populate('vendor');

    if (!kitchen) {
      return res.status(404).json({ message: 'Kitchen not found' });
    }

    if (req.user.role !== 'admin' && kitchen.vendor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this kitchen' });
    }

    if (req.body.name && req.body.name !== kitchen.name) {
      kitchen.slug = await createUniqueSlug(req.body.name, kitchen._id);
      kitchen.name = req.body.name;
    }

    ['description', 'serviceModes', 'address', 'isActive'].forEach((field) => {
      if (req.body[field] !== undefined) {
        kitchen[field] = req.body[field];
      }
    });

    await kitchen.save();

    const populatedKitchen = await Kitchen.findById(kitchen._id).populate('vendor');
    return res.status(200).json({ success: true, data: populatedKitchen });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete kitchen
// @route   DELETE /api/kitchens/:id
// @access  Private (Owner/Admin)
export const deleteKitchen = async (req, res, next) => {
  try {
    const kitchen = await Kitchen.findById(req.params.id).populate('vendor');

    if (!kitchen) {
      return res.status(404).json({ message: 'Kitchen not found' });
    }

    if (req.user.role !== 'admin' && kitchen.vendor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this kitchen' });
    }

    await kitchen.deleteOne();
    return res.status(200).json({ success: true, message: 'Kitchen deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
