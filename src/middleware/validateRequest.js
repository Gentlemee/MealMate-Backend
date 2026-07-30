const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isBoolean = (value) => typeof value === 'boolean';

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const isArrayOfStrings = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validateTime = (value) => /^\d{2}:\d{2}$/.test(value);

const validateGeoQueryParams = (query) => {
  const errors = [];
  const hasAnyGeoValue =
    query.lat !== undefined || query.lng !== undefined || query.radiusKm !== undefined;

  if (!hasAnyGeoValue) {
    return errors;
  }

  if (query.lat === undefined || Number.isNaN(Number(query.lat))) {
    errors.push('lat must be a valid number when using geolocation search');
  }

  if (query.lng === undefined || Number.isNaN(Number(query.lng))) {
    errors.push('lng must be a valid number when using geolocation search');
  }

  if (
    query.radiusKm === undefined ||
    Number.isNaN(Number(query.radiusKm)) ||
    Number(query.radiusKm) < 0
  ) {
    errors.push('radiusKm must be a non-negative number when using geolocation search');
  }

  return errors;
};

const validateAddress = (address, label = 'address') => {
  const errors = [];

  if (!isPlainObject(address)) {
    return [`${label} must be an object`];
  }

  ['street', 'city', 'state'].forEach((field) => {
    if (address[field] !== undefined && !isNonEmptyString(address[field])) {
      errors.push(`${label}.${field} must be a non-empty string`);
    }
  });

  if (address.country !== undefined && !isNonEmptyString(address.country)) {
    errors.push(`${label}.country must be a non-empty string`);
  }

  if (address.lat !== undefined && !isNumber(address.lat)) {
    errors.push(`${label}.lat must be a valid number`);
  }

  if (address.lng !== undefined && !isNumber(address.lng)) {
    errors.push(`${label}.lng must be a valid number`);
  }

  return errors;
};

const validateOpeningHours = (openingHours) => {
  const errors = [];

  if (!Array.isArray(openingHours)) {
    return ['openingHours must be an array'];
  }

  openingHours.forEach((item, index) => {
    if (!isPlainObject(item)) {
      errors.push(`openingHours[${index}] must be an object`);
      return;
    }

    if (!Number.isInteger(item.dayOfWeek) || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
      errors.push(`openingHours[${index}].dayOfWeek must be an integer from 0 to 6`);
    }

    if (!validateTime(item.opensAt || '')) {
      errors.push(`openingHours[${index}].opensAt must be in HH:MM format`);
    }

    if (!validateTime(item.closesAt || '')) {
      errors.push(`openingHours[${index}].closesAt must be in HH:MM format`);
    }
  });

  return errors;
};

const validateAvailability = (availability) => {
  const errors = [];

  if (!isPlainObject(availability)) {
    return ['availability must be an object'];
  }

  if (availability.isAvailable !== undefined && !isBoolean(availability.isAvailable)) {
    errors.push('availability.isAvailable must be a boolean');
  }

  ['dailyStock', 'remainingStock'].forEach((field) => {
    if (
      availability[field] !== undefined &&
      (!Number.isInteger(availability[field]) || availability[field] < 0)
    ) {
      errors.push(`availability.${field} must be a non-negative integer`);
    }
  });

  ['availableFrom', 'availableUntil'].forEach((field) => {
    if (availability[field] !== undefined && !validateTime(availability[field])) {
      errors.push(`availability.${field} must be in HH:MM format`);
    }
  });

  if (
    availability.blackoutDates !== undefined &&
    !isArrayOfStrings(availability.blackoutDates)
  ) {
    errors.push('availability.blackoutDates must be an array of strings');
  }

  return errors;
};

const runValidation = (validator) => (req, _res, next) => {
  const errors = validator(req);

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, errors));
  }

  return next();
};

exports.validateObjectIdParam = (paramName) =>
  runValidation((req) => {
    const value = req.params[paramName];
    if (!isValidObjectId(value)) {
      return [`${paramName} must be a valid MongoDB ObjectId`];
    }
    return [];
  });

exports.validateVendorCreate = runValidation((req) => {
  const errors = [];
  const body = req.body;

  if (!isNonEmptyString(body.businessName)) {
    errors.push('businessName is required');
  }

  if (!isNonEmptyString(body.phone)) {
    errors.push('phone is required');
  }

  if (
    body.minimumPrepTimeMinutes !== undefined &&
    (!Number.isInteger(body.minimumPrepTimeMinutes) || body.minimumPrepTimeMinutes < 0)
  ) {
    errors.push('minimumPrepTimeMinutes must be a non-negative integer');
  }

  if (
    body.deliveryRadiusKm !== undefined &&
    (!isNumber(body.deliveryRadiusKm) || body.deliveryRadiusKm < 0)
  ) {
    errors.push('deliveryRadiusKm must be a non-negative number');
  }

  if (body.address !== undefined) {
    errors.push(...validateAddress(body.address));
  }

  if (body.openingHours !== undefined) {
    errors.push(...validateOpeningHours(body.openingHours));
  }

  ['dietaryTags', 'cuisines'].forEach((field) => {
    if (body[field] !== undefined && !isArrayOfStrings(body[field])) {
      errors.push(`${field} must be an array of strings`);
    }
  });

  return errors;
});

exports.validateVendorUpdate = runValidation((req) => {
  const errors = [];
  const body = req.body;

  if (body.businessName !== undefined && !isNonEmptyString(body.businessName)) {
    errors.push('businessName must be a non-empty string');
  }

  if (body.phone !== undefined && !isNonEmptyString(body.phone)) {
    errors.push('phone must be a non-empty string');
  }

  if (body.email !== undefined && typeof body.email !== 'string') {
    errors.push('email must be a string');
  }

  if (
    body.minimumPrepTimeMinutes !== undefined &&
    (!Number.isInteger(body.minimumPrepTimeMinutes) || body.minimumPrepTimeMinutes < 0)
  ) {
    errors.push('minimumPrepTimeMinutes must be a non-negative integer');
  }

  if (
    body.deliveryRadiusKm !== undefined &&
    (!isNumber(body.deliveryRadiusKm) || body.deliveryRadiusKm < 0)
  ) {
    errors.push('deliveryRadiusKm must be a non-negative number');
  }

  if (body.address !== undefined) {
    errors.push(...validateAddress(body.address));
  }

  if (body.openingHours !== undefined) {
    errors.push(...validateOpeningHours(body.openingHours));
  }

  ['dietaryTags', 'cuisines'].forEach((field) => {
    if (body[field] !== undefined && !isArrayOfStrings(body[field])) {
      errors.push(`${field} must be an array of strings`);
    }
  });

  ['isOpenNow', 'isActive'].forEach((field) => {
    if (body[field] !== undefined && !isBoolean(body[field])) {
      errors.push(`${field} must be a boolean`);
    }
  });

  return errors;
});

exports.validateVendorQuery = runValidation((req) => validateGeoQueryParams(req.query));

exports.validateKitchenCreate = runValidation((req) => {
  const errors = [];
  const body = req.body;

  if (body.vendor !== undefined && !isValidObjectId(body.vendor)) {
    errors.push('vendor must be a valid MongoDB ObjectId');
  }

  if (!isNonEmptyString(body.name)) {
    errors.push('name is required');
  }

  if (body.serviceModes !== undefined && !isArrayOfStrings(body.serviceModes)) {
    errors.push('serviceModes must be an array of strings');
  }

  if (body.address !== undefined) {
    errors.push(...validateAddress(body.address));
  }

  return errors;
});

exports.validateKitchenUpdate = runValidation((req) => {
  const errors = [];
  const body = req.body;

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push('name must be a non-empty string');
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description must be a string');
  }

  if (body.serviceModes !== undefined && !isArrayOfStrings(body.serviceModes)) {
    errors.push('serviceModes must be an array of strings');
  }

  if (body.address !== undefined) {
    errors.push(...validateAddress(body.address));
  }

  if (body.isActive !== undefined && !isBoolean(body.isActive)) {
    errors.push('isActive must be a boolean');
  }

  return errors;
});

const validateVariants = (variants, label = 'variants') => {
  const errors = [];

  if (!Array.isArray(variants) || variants.length === 0) {
    return [`${label} must be a non-empty array`];
  }

  let defaultCount = 0;

  variants.forEach((variant, index) => {
    if (!isPlainObject(variant)) {
      errors.push(`${label}[${index}] must be an object`);
      return;
    }

    if (!isNonEmptyString(variant.name)) {
      errors.push(`${label}[${index}].name is required`);
    }

    if (!isNumber(variant.price) || variant.price < 0) {
      errors.push(`${label}[${index}].price must be a non-negative number`);
    }

    if (
      variant.discountPrice !== undefined &&
      variant.discountPrice !== null &&
      (!isNumber(variant.discountPrice) || variant.discountPrice < 0)
    ) {
      errors.push(`${label}[${index}].discountPrice must be a non-negative number or null`);
    }

    if (
      variant.discountPrice !== undefined &&
      variant.discountPrice !== null &&
      isNumber(variant.price) &&
      variant.discountPrice > variant.price
    ) {
      errors.push(`${label}[${index}].discountPrice cannot be greater than price`);
    }

    if (variant.servingLabel !== undefined && !isNonEmptyString(variant.servingLabel)) {
      errors.push(`${label}[${index}].servingLabel must be a non-empty string`);
    }

    if (variant.isDefault !== undefined && !isBoolean(variant.isDefault)) {
      errors.push(`${label}[${index}].isDefault must be a boolean`);
    }

    if (variant.isAvailable !== undefined && !isBoolean(variant.isAvailable)) {
      errors.push(`${label}[${index}].isAvailable must be a boolean`);
    }

    if (variant.isDefault === true) {
      defaultCount += 1;
    }
  });

  if (defaultCount > 1) {
    errors.push(`${label} can only contain one default variant`);
  }

  return errors;
};

exports.validateMealCategoryCreate = runValidation((req) => {
  const body = req.body;
  const errors = [];

  if (!isNonEmptyString(body.name)) {
    errors.push('name is required');
  }

  if (body.sortOrder !== undefined && !Number.isInteger(body.sortOrder)) {
    errors.push('sortOrder must be an integer');
  }

  if (body.isActive !== undefined && !isBoolean(body.isActive)) {
    errors.push('isActive must be a boolean');
  }

  return errors;
});

exports.validateMealCategoryUpdate = runValidation((req) => {
  const body = req.body;
  const errors = [];

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push('name must be a non-empty string');
  }

  if (body.sortOrder !== undefined && !Number.isInteger(body.sortOrder)) {
    errors.push('sortOrder must be an integer');
  }

  if (body.isActive !== undefined && !isBoolean(body.isActive)) {
    errors.push('isActive must be a boolean');
  }

  return errors;
});

exports.validateMealCreate = runValidation((req) => {
  const body = req.body;
  const errors = [];

  if (body.vendor !== undefined && !isValidObjectId(body.vendor)) {
    errors.push('vendor must be a valid MongoDB ObjectId');
  }

  if (body.kitchen !== undefined && !isValidObjectId(body.kitchen)) {
    errors.push('kitchen must be a valid MongoDB ObjectId');
  }

  if (!isValidObjectId(body.category || '')) {
    errors.push('category is required and must be a valid MongoDB ObjectId');
  }

  if (!isNonEmptyString(body.name)) {
    errors.push('name is required');
  }

  const hasPrice = body.price !== undefined;
  const hasVariants = body.variants !== undefined;

  if (!hasPrice && !hasVariants) {
    errors.push('either price or variants is required');
  }

  if (hasPrice && (!isNumber(body.price) || body.price < 0)) {
    errors.push('price must be a non-negative number');
  }

  if (body.discountPrice !== undefined && (!isNumber(body.discountPrice) || body.discountPrice < 0)) {
    errors.push('discountPrice must be a non-negative number');
  }

  if (
    body.prepTimeMinutes !== undefined &&
    (!Number.isInteger(body.prepTimeMinutes) || body.prepTimeMinutes < 0)
  ) {
    errors.push('prepTimeMinutes must be a non-negative integer');
  }

  ['dietaryTags', 'allergenTags'].forEach((field) => {
    if (body[field] !== undefined && !isArrayOfStrings(body[field])) {
      errors.push(`${field} must be an array of strings`);
    }
  });

  if (body.visibility !== undefined && !['draft', 'published', 'archived'].includes(body.visibility)) {
    errors.push('visibility must be one of draft, published, archived');
  }

  if (body.variants !== undefined) {
    errors.push(...validateVariants(body.variants));
  }

  if (body.availability !== undefined) {
    errors.push(...validateAvailability(body.availability));
  }

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      errors.push('images must be an array');
    } else {
      body.images.forEach((image, index) => {
        if (!isPlainObject(image)) {
          errors.push(`images[${index}] must be an object`);
          return;
        }
        if (!isNonEmptyString(image.imageUrl)) {
          errors.push(`images[${index}].imageUrl is required`);
        }
      });
    }
  }

  return errors;
});

exports.validateMealUpdate = runValidation((req) => {
  const body = req.body;
  const errors = [];

  ['vendor', 'kitchen', 'category'].forEach((field) => {
    if (body[field] !== undefined && !isValidObjectId(body[field])) {
      errors.push(`${field} must be a valid MongoDB ObjectId`);
    }
  });

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push('name must be a non-empty string');
  }

  if (body.price !== undefined && (!isNumber(body.price) || body.price < 0)) {
    errors.push('price must be a non-negative number');
  }

  if (
    body.discountPrice !== undefined &&
    body.discountPrice !== null &&
    (!isNumber(body.discountPrice) || body.discountPrice < 0)
  ) {
    errors.push('discountPrice must be a non-negative number or null');
  }

  if (
    body.prepTimeMinutes !== undefined &&
    (!Number.isInteger(body.prepTimeMinutes) || body.prepTimeMinutes < 0)
  ) {
    errors.push('prepTimeMinutes must be a non-negative integer');
  }

  ['dietaryTags', 'allergenTags'].forEach((field) => {
    if (body[field] !== undefined && !isArrayOfStrings(body[field])) {
      errors.push(`${field} must be an array of strings`);
    }
  });

  if (body.visibility !== undefined && !['draft', 'published', 'archived'].includes(body.visibility)) {
    errors.push('visibility must be one of draft, published, archived');
  }

  if (body.variants !== undefined) {
    errors.push(...validateVariants(body.variants));
  }

  if (body.availability !== undefined) {
    errors.push(...validateAvailability(body.availability));
  }

  return errors;
});

exports.validateMealQuery = runValidation((req) => {
  const errors = validateGeoQueryParams(req.query);

  ['vendor', 'kitchen', 'category'].forEach((field) => {
    if (req.query[field] !== undefined && req.query[field] !== '' && !isValidObjectId(req.query[field])) {
      errors.push(`${field} must be a valid MongoDB ObjectId when provided`);
    }
  });

  if (
    req.query.sort !== undefined &&
    !['newest', 'price_asc', 'price_desc', 'rating', 'popularity', 'distance'].includes(
      req.query.sort
    )
  ) {
    errors.push(
      'sort must be one of newest, price_asc, price_desc, rating, popularity, distance'
    );
  }

  return errors;
});

exports.validateMealAvailabilityUpdate = runValidation((req) =>
  validateAvailability(req.body)
);

exports.validateMealImageCreate = runValidation((req) => {
  const body = req.body;
  const errors = [];

  if (!isNonEmptyString(body.imageUrl)) {
    errors.push('imageUrl is required');
  }

  if (body.altText !== undefined && typeof body.altText !== 'string') {
    errors.push('altText must be a string');
  }

  if (body.isCover !== undefined && !isBoolean(body.isCover)) {
    errors.push('isCover must be a boolean');
  }

  return errors;
});

exports.validateMealImageUpdate = runValidation((req) => {
  const body = req.body;
  const errors = [];

  if (body.imageUrl !== undefined && !isNonEmptyString(body.imageUrl)) {
    errors.push('imageUrl must be a non-empty string');
  }

  if (body.altText !== undefined && typeof body.altText !== 'string') {
    errors.push('altText must be a string');
  }

  if (body.isCover !== undefined && !isBoolean(body.isCover)) {
    errors.push('isCover must be a boolean');
  }

  return errors;
});
