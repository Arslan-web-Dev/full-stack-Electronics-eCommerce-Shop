const express = require("express");
const router = express.Router();
const {
  signup,
  verifyEmail,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/auth");

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

module.exports = router;
