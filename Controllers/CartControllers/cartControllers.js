const asyncHandler = require("express-async-handler");
const cart = require("../../Models/CartModel/cartModel");
const products = require("../../Models/ProductsModel/productsModel");

const createCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.params.id;

  if (!productId || quantity === undefined) {
    res.status(400);
    throw new Error("all field is required");
  }
  //checking userId in param and token is equal or not
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  try {
    //cheking product available or not in db
    const productAva = await products.findOne({ _id: productId });
    if (!productAva) {
      res.status(400);
      throw new Error("product doesn't exist");
    }
    //cheking user cart available or not if not then create if have then update on same
    const cartava = await cart.findOne({ userId });

    //cheking cat not avaible and user trying to remove item
    if (!cartava && quantity < 1) {
      res.status(400);
      throw new Error("cart doesn't exist");
    }

    //if cart not availbe then create and update
    if (!cartava) {
      const carts = await cart.create({
        userId,
        items: [
          {
            productId,
            quantity,
          },
        ],
        totalItems: 1,
        totalPrice: productAva.price * quantity,
      });
      if (carts) {
        res.status(201).json({
          status: true,
          message: "cart created sucessfully",
          data: carts,
        });
      } else {
        res.status(400);
        throw new Error("something went wrong");
      }
    } else {
      //if cart already created
      //destructing items ,total from cartava
      let { items, totalItems, totalPrice } = cartava;

      //filtering product avaible or not in db which going to add or delete
      const toUpdatedItem = items.filter((item) => {
        return item.productId.toString() === productId;
      });
      //filtering prdoduct which not going to update or delete
      const tononUpdateItems = items.filter((item) => {
        return item.productId.toString() !== productId;
      });
      //checking if product availble on db then update  existing product
      if (toUpdatedItem.length > 0) {
        //user not tried more than item to remove which present on db
        if (toUpdatedItem[0].quantity < Math.abs(quantity) && quantity < 0) {
          res.status(400);
          throw new Error("invalid request chde");
        }

        //cheking and updating if user try to remove all that specfic product or remove product if user try to remove all peoduct avaible in cart
        if (
          quantity === 0 ||
          (toUpdatedItem[0].quantity === Math.abs(quantity) && quantity < 0)
        ) {
          totalPrice -= productAva.price * toUpdatedItem[0].quantity;
          totalItems -= toUpdatedItem[0].quantity;
          const afterRemoved = await cart.updateOne(
            { userId },
            { userId, items: tononUpdateItems, totalPrice, totalItems }
          );

          if (afterRemoved.acknowledged === true) {
            const cartfromdb = await cart.findOne({ userId });
            if (cartfromdb) {
              res.status(201).json({
                status: true,
                message: "cart updated sucessfully",
                data: cartfromdb,
              });
            } else {
              res.status(400);
              throw new Error("something went wrong");
            }
          } else {
            res.status(400);
            throw new Error("something went wrong");
          }
        } else {
          //adding/removing product which not match upper condition
          totalPrice += productAva.price * quantity;
          totalItems += quantity;
          toUpdatedItem[0].quantity += quantity;
          tononUpdateItems.push(toUpdatedItem[0]);

          const updatedcart = await cart.updateOne(
            { userId },
            { userId, items: tononUpdateItems, totalItems, totalPrice },
            { new: true }
          );
          if (updatedcart.acknowledged === true) {
            const cartfromdb = await cart.findOne({ userId });
            if (cartfromdb) {
              res.status(201).json({
                status: true,
                message: "cart updated sucessfully",
                data: cartfromdb,
              });
            } else {
              res.status(400);
              throw new Error("something went wrong");
            }
          } else {
            res.status(400);
            throw new Error("something went wrong");
          }
        }
      }
      //cheking and pushing into  cart when product already not exist on cart
      if (toUpdatedItem.length === 0) {
        if (quantity < 1) {
          res.status(400);
          throw new Error("something went wrong");
        }

        totalPrice += productAva.price * quantity;
        totalItems += quantity;

        items.push({ productId, quantity });

        const updatedcart = await cart.updateOne(
          { userId },
          { userId, items, totalItems, totalPrice },
          { new: true }
        );
        const cartfromdb = await cart.findOne({ userId });
        if (cartfromdb) {
          res.status(201).json({
            status: true,
            message: "cart updated sucessfully",
            data: cartfromdb,
          });
        } else {
          res.status(400);
          throw new Error("something went wrong");
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
  //   res.json("create cart sucessfully");
});

const updateCart = asyncHandler(async (req, res) => {});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  //checking userId in param and token is equal or not
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }
  try {
    const availableCartItems = await cart.find({ userId });
    if (!availableCartItems) {
      res.status(404);
      throw new Error("cart not found");
    }

    res.status(200).json({
      status: true,
      message: "cart get sucessfully",
      data: availableCartItems,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteCart = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  //checking userId in param and token is equal or not
  if (userId != req.user._id) {
    res.status(401);
    throw new Error("not Authorized");
  }

  try {
    const isCartAvailable = await cart.find({ userId });
    if (!isCartAvailable) {
      res.status(404);
      throw new Error("cart doesn't exist");
    }
    isDeleted = await cart.updateOne(
      { userId },
      { $set: { userId, items: [], totalItems: 0, totalPrice: 0 } }
    );
    if (isDeleted.acknowledged === true) {
      res.status(200);
      res.json({
        status: true,
        message: "cart deleted sucessfully",
      });
    }
  } catch (error) {}
});

module.exports = {
  createCart,
  updateCart,
  getCart,
  deleteCart,
};
