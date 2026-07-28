import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import User from "../models/Users.js";


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