const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getAllReviewsAdmin,
  toggleReviewApproval,
  deleteReview,
} = require("../controllers/reviews");
const { requireAuth, requireAdmin } = require("../middleware/jwtAuth");

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes
router.post("/", requireAuth, createReview);
router.delete("/:id", requireAuth, deleteReview);

// Admin-only routes
router.get("/admin", requireAuth, requireAdmin, getAllReviewsAdmin);
router.put("/admin/toggle/:id", requireAuth, requireAdmin, toggleReviewApproval);

module.exports = router;
