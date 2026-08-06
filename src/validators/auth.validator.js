import { body, validationResult } from "express-validator";

// Validation rules for registering a new user.
export const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];


// Middleware that checks if validation passed.
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules for logging in a user.
export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Validation rules for updating user information.
export const updateProfileValidation = [

    body("fullName")
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage("Full name must be at least 3 characters."),

    body("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email."),

    body("phone")
        .optional()
        .isLength({ min: 11 })
        .withMessage("Phone number must be at least 11 digits.")
];