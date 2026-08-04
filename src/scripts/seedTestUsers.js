import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/Users.js';
import Vendor from '../models/Vendor.js';
import generateToken from '../utils/generateToken.js';

dotenv.config();

const testUsers = [
  {
    name: 'MealMate Admin',
    email: 'admin@mealmate.com',
    password: 'Admin123!',
    phoneNumber: '+2348000000001',
    role: 'admin',
    address: {
      street: '1 Admin Road',
      city: 'Lagos',
      state: 'Lagos',
    },
    isVerified: true,
  },
  {
    name: 'MealMate Vendor',
    email: 'vendor@mealmate.com',
    password: 'Vendor123!',
    phoneNumber: '+2348000000002',
    role: 'vendor',
    address: {
      street: '2 Vendor Street',
      city: 'Lagos',
      state: 'Lagos',
    },
    isVerified: true,
    vendorProfile: {
      businessName: 'MealMate Vendor Kitchen',
      description: 'Default seeded vendor profile for API testing',
      phone: '+2348000000002',
      email: 'vendor@mealmate.com',
      verificationStatus: 'verified',
      isActive: true,
      isOpenNow: true,
      minimumPrepTimeMinutes: 45,
      deliveryRadiusKm: 8,
      averageRating: 4.5,
      totalReviews: 12,
      address: {
        street: '2 Vendor Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        lat: 6.5244,
        lng: 3.3792,
      },
      dietaryTags: ['halal'],
      cuisines: ['nigerian'],
      coverImage: '',
      openingHours: [
        {
          dayOfWeek: 1,
          opensAt: '08:00',
          closesAt: '19:00',
        },
        {
          dayOfWeek: 2,
          opensAt: '08:00',
          closesAt: '19:00',
        },
      ],
    },
  },
];

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createUniqueVendorSlug = async (value, excludeId = null) => {
  const baseSlug = buildSlug(value);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingVendor = await Vendor.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existingVendor) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

const upsertUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email }).select('+password');

  if (!existingUser) {
    const createdUser = await User.create(payload);
    return createdUser;
  }

  existingUser.name = payload.name;
  existingUser.phoneNumber = payload.phoneNumber;
  existingUser.role = payload.role;
  existingUser.address = payload.address;
  existingUser.isVerified = payload.isVerified;
  existingUser.password = payload.password;

  await existingUser.save();
  return existingUser;
};

const upsertVendorProfile = async (user, vendorPayload) => {
  if (!vendorPayload || user.role !== 'vendor') {
    return null;
  }

  const existingVendor = await Vendor.findOne({ user: user._id });
  const slug = await createUniqueVendorSlug(
    vendorPayload.businessName,
    existingVendor ? existingVendor._id : null
  );

  if (!existingVendor) {
    return Vendor.create({
      user: user._id,
      slug,
      ...vendorPayload,
    });
  }

  existingVendor.businessName = vendorPayload.businessName;
  existingVendor.slug = slug;
  existingVendor.description = vendorPayload.description;
  existingVendor.phone = vendorPayload.phone;
  existingVendor.email = vendorPayload.email;
  existingVendor.verificationStatus = vendorPayload.verificationStatus;
  existingVendor.isActive = vendorPayload.isActive;
  existingVendor.isOpenNow = vendorPayload.isOpenNow;
  existingVendor.minimumPrepTimeMinutes = vendorPayload.minimumPrepTimeMinutes;
  existingVendor.deliveryRadiusKm = vendorPayload.deliveryRadiusKm;
  existingVendor.averageRating = vendorPayload.averageRating;
  existingVendor.totalReviews = vendorPayload.totalReviews;
  existingVendor.address = vendorPayload.address;
  existingVendor.dietaryTags = vendorPayload.dietaryTags;
  existingVendor.cuisines = vendorPayload.cuisines;
  existingVendor.coverImage = vendorPayload.coverImage;
  existingVendor.openingHours = vendorPayload.openingHours;

  await existingVendor.save();
  return existingVendor;
};

const run = async () => {
  try {
    await connectDB();

    const seededUsers = [];
    for (const payload of testUsers) {
      const user = await upsertUser(payload);
      const vendorProfile = await upsertVendorProfile(user, payload.vendorProfile);
      seededUsers.push({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        password: payload.password,
        token: generateToken(user._id.toString()),
        vendorProfileId: vendorProfile ? vendorProfile._id.toString() : null,
      });
    }

    console.log('Test users seeded successfully.');
    console.log(JSON.stringify({ users: seededUsers }, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed test users:', error.message);
    process.exit(1);
  }
};

void run();
