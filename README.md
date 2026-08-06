# MealMate-Backend

MealMate TechCrush Capstone project.

## Scope Covered In This Branch

This branch contains the backend work for:

- Vendor management
- Kitchen management
- Meal management
- Meal categories
- Meal availability
- Meal images
- Popular meals
- Recommended meals
- Request validation for the above endpoints
- Global API error handling for the above endpoints

This branch does not implement the full platform. Other modules such as auth, orders, payments, riders, notifications, cart, and admin can be developed alongside this work without route collisions because this scope is mounted under:

```text
/api/vendors
/api/kitchens
/api/meals
```

## Tech Stack In This Repo

This repository currently uses:

- Node.js
- Express
- MongoDB
- Mongoose

## Local Run

The API is configured to run on:

```text
http://localhost:3000
```

Base API URL:

```text
http://localhost:3000/api
```

Start the server:

```bash
npm run dev
```

## Seed Test Users

Seed test users and the default vendor profile:

```bash
npm run seed:test-users
```

The seed script creates or updates:

- `admin@mealmate.com`
- `vendor@mealmate.com`

It also ensures the vendor user has a linked vendor profile so vendor-protected endpoints can be tested immediately.

## Postman Collection

Import:

```text
postman/MealMate-Vendor-Kitchen-Meal.postman_collection.json
```

Recommended Postman variables:

```text
baseUrl = http://localhost:3000/api
adminToken =
vendorToken =
vendorId =
kitchenId =
categoryId =
mealId =
imageId =
```

## Suggested Test Order

1. Authenticate as admin and vendor using the auth module used by your team.
2. Set `adminToken` and `vendorToken` in Postman.
3. Run `Create Meal Category` with `adminToken`.
4. Copy the returned id into `categoryId`.
5. Run `Create Vendor` with `vendorToken` only if the seeded vendor profile is not already being reused.
6. Copy the returned vendor id into `vendorId`.
7. Run `Create Kitchen` with `vendorToken`.
8. Copy the returned kitchen id into `kitchenId`.
9. Run `Create Meal With Variants` with `vendorToken`.
10. Copy the returned meal id into `mealId`.
11. Test the remaining read and update endpoints.

## Implemented API Surface

### Vendor APIs

- `POST /api/vendors`
- `GET /api/vendors`
- `GET /api/vendors/:id`
- `PATCH /api/vendors/:id`
- `DELETE /api/vendors/:id`

### Kitchen APIs

- `POST /api/kitchens`
- `GET /api/kitchens`
- `PATCH /api/kitchens/:id`
- `DELETE /api/kitchens/:id`

### Meal APIs

- `POST /api/meals`
- `GET /api/meals`
- `GET /api/meals/:id`
- `PATCH /api/meals/:id`
- `DELETE /api/meals/:id`

### Meal Extras

- `GET /api/meals/popular`
- `GET /api/meals/recommended`
- `GET /api/meals/categories`
- `POST /api/meals/categories`
- `PATCH /api/meals/categories/:id`
- `DELETE /api/meals/categories/:id`
- `GET /api/meals/:id/availability`
- `PATCH /api/meals/:id/availability`
- `GET /api/meals/:id/images`
- `POST /api/meals/:id/images`
- `PATCH /api/meals/:id/images/:imageId`
- `DELETE /api/meals/:id/images/:imageId`

## Notes For Integration

- Vendor, kitchen, and meal routes are isolated from rider, auth, payment, order, notification, cart, and admin route groups.
- Protected routes require `Authorization: Bearer <token>`.
- Validation failures return `400` with a `details` array.
- Invalid MongoDB ids return `400`.
- Unknown routes return `404`.
- Meals support either a flat `price` or structured `variants`.
- The public product language is now `kitchen`, not `restaurant`.
- Geolocation support exists for discovery, but frontend forms can still collect normal address fields such as city and state.

## Meal Variant Support

Meals can now store variant-based pricing to match the UI flow for options such as:

- `Regular`
- `Large`
- `Family Pack`
- `Extended Family Pack`

Each variant can include:

- `name`
- `price`
- `discountPrice`
- `servingLabel`
- `isDefault`
- `isAvailable`
