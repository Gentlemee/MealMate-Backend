import Notification from "../models/Notification.js";

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    if (notification.recipient.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getUserNotifications, markAsRead };
