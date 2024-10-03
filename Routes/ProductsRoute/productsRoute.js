const {
  setProducts,
  UpdateProduct,
  getProducts,
  getSingleProduct,
  deleteProduct,
} = require("../../Controllers/ProductsController/productControllers");
const {
  authAdmin,
} = require("../../Middlewares/AuthMiddleware/authMiddleware");

const router = require("express").Router();

router.post("/products", authAdmin, setProducts);
router.put("/products/:id", authAdmin, UpdateProduct);
router.delete("/products/:id", authAdmin, deleteProduct);
router.get("/products", getProducts);
router.get("/products/:id", getSingleProduct);

module.exports = router;
