import Order from "../models/Order.js";
import Cart from "../models/cart.js";

const createOrder = async (customerId, deliveryAddress, paymentMethod) => {
  const cart = await Cart.findOne({ customer: customerId }).populate({ path: "items.meal", populate: { path: "vendor" } });
  if (!cart) throw new Error("Cart not found");
  if (cart.items.length === 0) throw new Error("Your cart is empty");

  const vendorGroups = {};
  cart.items.forEach((item) => {
    if (!item.meal) throw new Error("Meal not found");
    if (!item.meal.vendor) throw new Error(`Vendor not found for ${item.meal.name}`);
    if (!item.meal.availability.isAvailable) throw new Error(`${item.meal.name} is currently unavailable`);
    const vendorId = item.meal.vendor._id.toString();
    if (!vendorGroups[vendorId]) vendorGroups[vendorId] = [];
    vendorGroups[vendorId].push(item);
  });

  const createdOrders = [];
  for (const vendorId in vendorGroups) {
    const vendorItems = vendorGroups[vendorId];
    let totalAmount = 0;
    const orderItems = vendorItems.map((item) => {
      const price = item.meal.discountPrice || item.meal.price;
      totalAmount += price * item.quantity;
      return { meal: item.meal._id, vendor: item.meal.vendor._id, quantity: item.quantity, price };
    });

    const order = await Order.create({ customer: customerId, items: orderItems, totalAmount, deliveryAddress, paymentMethod });
    const populatedOrder = await Order.findById(order._id).populate("customer", "name email phoneNumber").populate("items.meal").populate("items.vendor", "businessName");
    createdOrders.push(populatedOrder);
  }

  cart.items = [];
  await cart.save();
  return createdOrders;
};

const getMyOrders = async (customerId) => Order.find({ customer: customerId }).populate("items.meal").populate("items.vendor", "businessName").sort({ createdAt: -1 });

const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId).populate("customer", "name email phoneNumber").populate("items.meal").populate("items.vendor", "businessName");
  if (!order) throw new Error("Order not found");
  if (user.role === "admin") return order;
  if (user.role === "customer" && order.customer._id.toString() !== user._id.toString()) throw new Error("Not authorized");
  if (user.role === "vendor") {
    const vendorId = user.vendor ? user.vendor.toString() : user._id.toString();
    const hasVendorMeal = order.items.some((item) => item.vendor._id.toString() === vendorId);
    if (!hasVendorMeal) throw new Error("Not authorized");
  }
  return order;
};

const cancelOrder = async (orderId, customerId) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) throw new Error("Order not found");
  if (!["pending", "accepted"].includes(order.orderStatus)) throw new Error("Order can no longer be cancelled");
  order.orderStatus = "cancelled";
  await order.save();
  return order;
};

const getOrderHistory = async (customerId) => Order.find({ customer: customerId, orderStatus: { $in: ["delivered", "cancelled"] } }).populate("items.meal").populate("items.vendor", "businessName").sort({ createdAt: -1 });
const getVendorOrders = async (vendorId) => Order.find({ "items.vendor": vendorId }).populate("customer", "name phoneNumber").populate("items.meal").sort({ createdAt: -1 });

const updateOrderStatus = async (orderId, status, vendorId) => {
  const allowedStatuses = ["accepted", "preparing", "ready", "out_for_delivery", "delivered"];
  if (!allowedStatuses.includes(status)) throw new Error("Invalid order status");
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  const hasVendorMeal = order.items.some((item) => item.vendor.toString() === vendorId.toString());
  if (!hasVendorMeal) throw new Error("Not authorized");
  order.orderStatus = status;
  await order.save();
  return Order.findById(order._id).populate("customer", "name email phoneNumber").populate("items.meal").populate("items.vendor", "businessName");
};

export { createOrder, getMyOrders, getOrderById, cancelOrder, getOrderHistory, getVendorOrders, updateOrderStatus };
