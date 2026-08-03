import Rider from "../models/Rider.js";

const registerRiderProfile = async (req, res) => {
  try {
    const { vehicleType, licensePlate } = req.body;
    let rider = await Rider.findOne({ user: req.user.id });
    if (rider) return res.status(400).json({ message: "Rider profile already exists" });
    rider = await Rider.create({ user: req.user.id, vehicleType, licensePlate });
    res.status(201).json({ success: true, data: rider });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRiderProfile = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user.id }).populate("user", "name email phoneNumber role");
    if (!rider) return res.status(404).json({ message: "Rider profile not found" });
    res.status(200).json({ success: true, data: rider });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const rider = await Rider.findOne({ user: req.user.id });
    if (!rider) return res.status(404).json({ message: "Rider profile not found" });
    if (rider.status !== "approved") return res.status(403).json({ message: "Your account must be approved by an admin before going online" });
    rider.isAvailable = !rider.isAvailable;
    await rider.save();
    res.status(200).json({ success: true, isAvailable: rider.isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { registerRiderProfile, getRiderProfile, toggleAvailability };
