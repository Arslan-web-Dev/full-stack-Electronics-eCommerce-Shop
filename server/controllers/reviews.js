const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

/**
 * Recalculate and update the average rating for a Product
 */
async function updateProductAverageRating(productId) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      isApproved: true,
    },
    select: {
      rating: true,
    },
  });

  let avgRating = 5; // Default rating if no reviews
  if (reviews.length > 0) {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    avgRating = Math.round(total / reviews.length);
  }

  await prisma.product.update({
    where: { id: productId },
    data: { rating: avgRating },
  });

  return avgRating;
}

/**
 * Add a review for a Product
 */
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!productId || !rating || !comment) {
    throw new AppError("Product ID, rating, and comment are required", 400);
  }

  const numericRating = parseInt(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError("Rating must be an integer between 1 and 5", 400);
  }

  // Verify product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: { productId, userId },
  });

  let review;
  if (existingReview) {
    // Update existing review
    review = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating: numericRating,
        comment: comment.trim(),
        isApproved: true,
      },
    });
  } else {
    // Create new review
    review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: numericRating,
        comment: comment.trim(),
        isApproved: true,
      },
    });
  }

  // Update product average rating
  await updateProductAverageRating(productId);

  res.status(201).json({
    message: "Review successfully saved!",
    review,
  });
});

/**
 * Get approved reviews for a Product
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(reviews);
});

/**
 * Get all reviews (for Admin Moderation Panel)
 */
const getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(reviews);
});

/**
 * Toggle Review Approval Status (Admin)
 */
const toggleReviewApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Review ID is required", 400);
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: { isApproved: !review.isApproved },
  });

  // Re-calculate rating
  await updateProductAverageRating(review.productId);

  res.status(200).json({
    message: `Review approval toggled to: ${updatedReview.isApproved}`,
    review: updatedReview,
  });
});

/**
 * Delete a review (Admin or Owner)
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Review ID is required", 400);
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  // Ensure requester is either admin or the owner of the review
  if (req.user.role !== "admin" && req.user.id !== review.userId) {
    throw new AppError("Unauthorized to delete this review", 403);
  }

  await prisma.review.delete({ where: { id } });

  // Update product average rating
  await updateProductAverageRating(review.productId);

  res.status(204).send();
});

module.exports = {
  createReview,
  getProductReviews,
  getAllReviewsAdmin,
  toggleReviewApproval,
  deleteReview,
};
