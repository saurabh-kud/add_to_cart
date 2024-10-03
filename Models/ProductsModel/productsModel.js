const mongoose = require("mongoose");

const productsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currencyId: {
      type: String,
      required: true,
      default: "INR",
    },
    currencyFormat: {
      type: String,
      required: true,
      default: "₹",
    },
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    productImage: {
      type: String,
      // required: true,
      default: null,
    },
    availableSizes: {
      type: [{ type: String }],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Products", productsSchema);
