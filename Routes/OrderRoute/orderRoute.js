const {
  createOrder,
  createOrderNon,
  updateOrder,
  getOrder,
  deleteOrder,
  getSingleOrder,
  verifyOrder,
  verifyOrderNon,
} = require("../../Controllers/OrderController/orderController");
const {
  authAdmin,
  auth,
} = require("../../Middlewares/AuthMiddleware/authMiddleware");

const router = require("express").Router();

router.post("/:id/order", auth, createOrder);
router.post("/order", createOrderNon); // for use payment on diffrent site where user is not available
router.put("/:id/order/:orderid", auth, updateOrder);
router.get("/:id/order", auth, getOrder);
router.get("/:id/order/:orderid", auth, getSingleOrder);
router.delete("/:id/order/:orderid", authAdmin, deleteOrder);
router.post("/:id/order/verify", auth, verifyOrder);
router.post("/order/verify", verifyOrderNon); // for use payment on diffrent site where user is not available

module.exports = router;
