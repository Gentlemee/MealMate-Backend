import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import User from "../models/Users.js";
import sendEmail from "../utils/sendEmail.js";


// Register Service
export const registerUser = async (userData) => {
    const { fullName, email, phone, password, role } = userData;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, phone, password: hashedPassword, role }); 
    const token = generateToken(user._id);
    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
        },
        token,
    };
}; 

// Login Service 
export const loginUser = async (userData) => {
  const { email, password } = userData;

  // Check if the user exists
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // Compare passwords
  const isPasswordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password.");
  }

  // Generate JWT
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    },
    token,
  };
};

// getProfile Service
export const getProfile = async (userId) => {

    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
};

// updateProfile Service
export const updateProfile = async (userId, updateData) => {

    // Check if the email is being changed
    if (updateData.email) {
        const existingUser = await User.findOne({
            email: updateData.email
        });

        if (
            existingUser &&
            existingUser._id.toString() !== userId.toString()
        ) {
            throw new Error("Email is already in use.");
        }
    }
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!updatedUser) {
        throw new Error("User not found.");
    }
    return updatedUser;
};

// logout Service
export const logoutUser = async () => {
    return {
        message: "Logged out successfully."
    };
};
// Forgot Password Service
export const forgotPassword = async ({ email }) => {
  if (!email) {
    throw new Error("Email is required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5000"}/api/auth/reset-password/${resetToken}`;
  const message = `You requested a password reset. Send a POST request to ${resetUrl} with your new password.`;

  const emailSent = await sendEmail({
    email: user.email,
    subject: "MealMate Password Reset",
    message,
  });

  return {
    message: emailSent
      ? "Password reset instructions sent."
      : "Password reset token generated.",
    resetToken,
    resetUrl,
    emailSent,
  };
};

// Reset Password Service
export const resetPassword = async (token, password) => {
  if (!token) {
    throw new Error("Reset token is required.");
  }

  if (!password) {
    throw new Error("New password is required.");
  }

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedResetToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token.");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    message: "Password reset successful.",
  };
};
