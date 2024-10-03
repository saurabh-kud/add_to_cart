const express = require("express");
const {
  register,
  login,
  profile,
  refresh,
  profileUpdate,
} = require("../../Controllers/UserControllers/userControllers");
const { auth } = require("../../Middlewares/AuthMiddleware/authMiddleware");
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/:id/profile", auth, profile);
router.put("/:id/profile", auth, profileUpdate);
router.post("/refresh", refresh);

module.exports = router;
