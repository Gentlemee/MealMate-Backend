import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "bicycle", "car", "van"],
      required: [true, "Please specify vehicle type"],
    },
    licensePlate: {
      type: String,
      required: [true, "Please add license plate number"],
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const Rider = mongoose.model("Rider", riderSchema);
export default Rider;
