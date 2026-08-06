import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Favourite = mongoose.model("Favourite", favouriteSchema);

export default Favourite;