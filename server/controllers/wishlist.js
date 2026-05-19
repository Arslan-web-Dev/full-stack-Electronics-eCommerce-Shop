const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const getAllWishlist = asyncHandler(async (request, response) => {
  const wishlist = await prisma.wishlist.findMany({
    include: {
      product: true,
      user: true,
    },
  });
  return response.json(wishlist);
});

const getAllWishlistByUserId = asyncHandler(async (request, response) => {
  const { userId } = request.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const wishlist = await prisma.wishlist.findMany({
    where: {
      userId: userId,
    },
    include: {
      product: true,
    },
  });

  return response.json(wishlist);
});

const getSingleProductFromWishlist = asyncHandler(async (request, response) => {
  const { userId, productId } = request.params;

  if (!userId || !productId) {
    throw new AppError("User ID and Product ID are required", 400);
  }

  const wishItem = await prisma.wishlist.findFirst({
    where: {
      userId: userId,
      productId: productId,
    },
    include: {
      product: true,
    },
  });

  if (!wishItem) {
    throw new AppError("Wishlist item not found", 404);
  }

  return response.json(wishItem);
});

const createWishItem = asyncHandler(async (request, response) => {
  const { userId, productId } = request.body;

  if (!userId || !productId) {
    throw new AppError("User ID and Product ID are required", 400);
  }

  // Check if the wishlist item already exists
  const existingWishItem = await prisma.wishlist.findFirst({
    where: {
      userId: userId,
      productId: productId,
    },
  });

  if (existingWishItem) {
    throw new AppError("Product is already in the wishlist", 409);
  }

  const wishItem = await prisma.wishlist.create({
    data: {
      userId,
      productId,
    },
    include: {
      product: true,
    },
  });

  return response.status(201).json(wishItem);
});

const deleteWishItem = asyncHandler(async (request, response) => {
  const { userId, productId } = request.params;

  if (!userId || !productId) {
    throw new AppError("User ID and Product ID are required", 400);
  }

  const existingWishItem = await prisma.wishlist.findFirst({
    where: {
      userId: userId,
      productId: productId,
    },
  });

  if (!existingWishItem) {
    throw new AppError("Wishlist item not found", 404);
  }

  await prisma.wishlist.delete({
    where: {
      id: existingWishItem.id,
    },
  });

  return response.status(204).send();
});

module.exports = {
  getAllWishlist,
  getAllWishlistByUserId,
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist,
};
