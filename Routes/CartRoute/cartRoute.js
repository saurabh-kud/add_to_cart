const {
  createCart,
  updateCart,
  getCart,
  deleteCart,
} = require("../../Controllers/CartControllers/cartControllers");
const { auth } = require("../../Middlewares/AuthMiddleware/authMiddleware");

const router = require("express").Router();

router.post("/:id/cart", auth, createCart);
router.put("/:id/cart", auth, updateCart);
router.get("/:id/cart", auth, getCart);
router.delete("/:id/cart", auth, deleteCart);

module.exports = router;
