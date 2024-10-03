const asyncHandler = require("express-async-handler");
const cart = require("../../Models/CartModel/cartModel");
const user = require("../../Models/UsersModel/userModel");
const order = require("../../Models/OrderModel/orderModel");
const crypto = require("crypto");
const rzpOb = require("../../config/razorpay");
const { log } = require("console");
const razorpay = rzpOb();

//create order for validated user
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }
  try {
    const isCartAvaible = await cart.findOne({ userId });

    if (!isCartAvaible || isCartAvaible.items.length <= 0) {
      res.status(404);
      throw new Error("cart doesn't exist");
    }
    const cartDetails = {
      userId,
      items: isCartAvaible.items,
      totalPrice: isCartAvaible.totalPrice,
      totalItems: isCartAvaible.totalItems,
      status: "pending",
      iscancellable: true,
    };
    // var options = {
    //   amount: isCartAvaible.totalPrice * 100, // amount in the smallest currency unit
    //   currency: "INR",
    //   receipt: userId,
    //   notes: { userId },
    // };
    // const rzpOrder = await razorpay.orders.create(options);
    // res.json({
    //   status: true,
    //   message: "order Placed sucessfully",
    //   data: { ...rzpOrder },
    // });

    const orderFromDb = await order.create(cartDetails);
    if (orderFromDb) {
      await cart.deleteOne({ userId });
      res.status(201);
      res.json({
        status: true,
        message: "order created",
        data: orderFromDb,
      });
    } else {
      res.status(400);
      throw new Error("something went wrong");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
});

//create order for diff site not validated user
const createOrderNon = asyncHandler(async (req, res) => {
  try {
    const { amount } = req.body;

    var options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
    };
    const rzpOrder = await razorpay.orders.create(options);
    res.json({
      status: true,
      message: "order created sucessfully",
      data: { ...rzpOrder },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

//validate payment for validated user

const verifyOrder = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  try {
    const isCartAvaible = await cart.findOne({ userId });

    if (!isCartAvaible || isCartAvaible.items.length <= 0) {
      res.status(404);
      throw new Error("cart doesn't exist");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET);
    //order_id + "|" + razorpay_payment_id
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");
    if (digest !== razorpay_signature) {
      throw new Error("Transaction is not legit!");
    }

    const cartDetails = {
      userId,
      items: isCartAvaible.items,
      totalPrice: isCartAvaible.totalPrice,
      totalItems: isCartAvaible.totalItems,
      r_paymentId: razorpay_payment_id,
      r_orderId: razorpay_order_id,
      status: "Paid",
      iscancellable: true,
    };
    const orderFromDb = await order.create(cartDetails);

    if (orderFromDb) {
      await cart.deleteOne({ userId });
      res.status(201);
      res.json({
        status: true,
        message: "order Placed sucessfully",
        data: {
          rporderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          status: orderFromDb.status,
          items: orderFromDb.items,
          totalPrice: orderFromDb.totalPrice,
          orderId: orderFromDb._id,
        },
      });
    } else {
      res.status(400);
      throw new Error("something went wrong");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

//for verification of order
const verifyOrderNon = asyncHandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET);
    //order_id + "|" + razorpay_payment_id
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");
    if (digest !== razorpay_signature) {
      throw new Error("Transaction is not legit!");
    }

    res.status(201);
    res.json({
      status: true,
      message: "order Placed sucessfully",
      data: {
        rporderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

//for updating order details
const updateOrder = asyncHandler(async (req, res) => {
  const { id: userId, orderid: orderId } = req.params;
  const { status } = req.body;
  if (!status) {
    res.status(401);
    throw new Error("all field is required");
  }
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  if (!req.user.isAdmin) {
    if (status !== "cancelled") {
      res.status(400);
      throw new Error("not permited to do this");
    }
  }
  try {
    if (!req.user.isAdmin) {
      var isOrderAvailable = await order.findOne({
        _id: orderId,
        cancellable: true,
        userId,
      });
    } else {
      isOrderAvailable = await order.findOne({
        _id: orderId,
        cancellable: true,
      });
    }

    if (isOrderAvailable) {
      const updatedOrder = {
        userId: isOrderAvailable.userId,
        _id: isOrderAvailable._id,
        items: isOrderAvailable.items,
        totalPrice: isOrderAvailable.totalPrice,
        totalItems: isOrderAvailable.totalItems,
        cancellable: isOrderAvailable.cancellable,
        status,
      };

      const isUpdated = await order.findByIdAndUpdate(
        { _id: orderId },
        updatedOrder,
        { new: true }
      );

      if (isUpdated) {
        res.status(200);
        res.json({
          status: true,
          message: "order Updated",
          data: isUpdated,
        });
      } else {
        res.status(400);
        throw new Error("something went wrong");
      }
    } else {
      res.status(400);
      throw new Error("order doesn't exist");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getOrder = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }
  try {
    const isOrderAvailable = await order.find({ userId });
    if (isOrderAvailable.length > 0) {
      res.status(200);
      res.json({
        status: true,
        message: "order get sucessfully",
        data: isOrderAvailable,
      });
    } else {
      res.status(200);
      res.json({
        status: true,
        message: "you haven't placed any order",
        data: [],
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const getSingleOrder = asyncHandler(async (req, res) => {
  const { id: userId, orderid: orderId } = req.params;
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  try {
    const isOrderAvailable = await order.findOne({ userId, _id: orderId });
    if (isOrderAvailable) {
      res.status(200);
      res.json({
        status: true,
        message: "order get sucessfully",
        data: isOrderAvailable,
      });
    } else {
      res.status(400);
      throw new Error("order doesn't exist");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id: userId, orderid: orderId } = req.params;
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }
  try {
    const isOrderAvailable = await order.findOne({ _id: orderId });
    if (isOrderAvailable) {
      const isDeleted = await order.findByIdAndDelete({ _id: orderId });

      if (isDeleted) {
        res.status(200);
        res.json({
          status: true,
          message: "order deleted",
          data: isDeleted,
        });
      } else {
        res.status(400);
        throw new Error("something went wrong");
      }
    } else {
      res.status(400);
      throw new Error("order doesn't exist");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  createOrder,
  createOrderNon,
  verifyOrder,
  verifyOrderNon,
  updateOrder,
  getOrder,
  getSingleOrder,
  deleteOrder,
};
