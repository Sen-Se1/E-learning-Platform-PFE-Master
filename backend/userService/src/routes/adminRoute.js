const express = require("express");
const router = express.Router();
const {
  getUserValidator,
  updateUserAdminValidator,
  updateUserPasswordValidator,
  createUserAdminValidator,
  toggleUserStatusValidator,
  aiChatValidator
} = require("../utils/validators/adminValidator");
const {
  getUser,
  getAllUsers,
  createUser,
  updateUser,
  updateUserPassword,
  toggleUserStatus,
  deleteUser,
  aiChat
} = require("../controllers/adminController");
const {
  protect,
  allowedTo,
  isProfileOwner,
} = require("../middleware/authMiddleware");
const { authLimiter } = require("../utils/rateLimiter");

router.get("/user", protect, allowedTo("admin"), getAllUsers);
router.get("/user/:id", protect, allowedTo("admin"), getUserValidator, isProfileOwner, getUser);
router.post("/user", protect, allowedTo("admin"), createUserAdminValidator, createUser);
router.patch("/user/:id/profile", protect, allowedTo("admin"), updateUserAdminValidator, isProfileOwner, updateUser);
router.patch("/user/:id/password", protect, allowedTo("admin"), authLimiter, updateUserPasswordValidator, isProfileOwner, updateUserPassword);
router.patch("/user/:id/toggle-status", protect, allowedTo("admin"), toggleUserStatusValidator, isProfileOwner, toggleUserStatus);
router.delete("/user/:id", protect, allowedTo("admin"), isProfileOwner, deleteUser);
router.post("/ai-chat", protect, allowedTo("admin"), aiChatValidator, aiChat);
module.exports = router;
