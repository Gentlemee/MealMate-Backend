import Address from "../models/address.js";

export const createAddress = async (customerId, data) => {
  const { fullName, phone, address, city, state, isDefault } = data;

  if (isDefault) {
    await Address.updateMany(
      { customer: customerId },
      { $set: { isDefault: false } }
    );
  }

  return await Address.create({
    customer: customerId,
    fullName,
    phone,
    address,
    city,
    state,
    isDefault,
  });
};

export const getAddresses = async (customerId) => {
  return await Address.find({ customer: customerId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

export const updateAddress = async (customerId, addressId, data) => {
  const address = await Address.findOne({
    _id: addressId,
    customer: customerId,
  });

  if (!address) {
    throw new Error("Address not found");
  }

  if (data.isDefault) {
    await Address.updateMany(
      { customer: customerId },
      { $set: { isDefault: false } }
    );
  }

  Object.assign(address, data);

  return await address.save();
};

export const deleteAddress = async (customerId, addressId) => {
  const address = await Address.findOneAndDelete({
    _id: addressId,
    customer: customerId,
  });

  if (!address) {
    throw new Error("Address not found");
  }

  return address;
};