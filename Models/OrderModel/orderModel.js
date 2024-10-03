const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    cancellable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed", "cancelled", "Paid"],
    },
    r_orderId: {
      type: String,
    },
    r_paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("orders", orderSchema);
