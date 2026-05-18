const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_51PTestKey1234567890";
const stripe = require("stripe")(stripeKey);

/**
 * Create a Stripe Payment Intent
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    throw new AppError("Order ID and amount are required", 400);
  }

  // Double check order exists
  const order = await prisma.customer_order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError("Associated order not found", 404);
  }

  try {
    console.log(`💳 Creating Stripe Payment Intent for Order ${orderId}, Amount: $${amount}`);
    
    // Amount must be in cents (Math.round to prevent floating point issues)
    const centsAmount = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: centsAmount,
      currency: "usd",
      metadata: {
        orderId: order.id,
        userId: req.user ? req.user.id : "guest",
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      stripePaymentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    throw new AppError(`Stripe Payment Intent creation failed: ${error.message}`, 500);
  }
});

/**
 * Record payment status (Stripe or Cash on Delivery)
 */
const recordPayment = asyncHandler(async (req, res) => {
  const { orderId, stripePaymentId, amount, method, status } = req.body;

  if (!orderId || !amount || !method || !status) {
    throw new AppError("Missing required payment details", 400);
  }

  // Find order
  const order = await prisma.customer_order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      orderId,
      userId: req.user ? req.user.id : null,
      stripePaymentId: stripePaymentId || null,
      amount: parseInt(amount),
      method, // "stripe", "cod"
      status, // "pending", "completed", "failed"
    },
  });

  // Update order status if payment is completed or is COD
  let updatedOrderStatus = "pending";
  if (method === "stripe" && status === "completed") {
    updatedOrderStatus = "processing";
  } else if (method === "cod") {
    updatedOrderStatus = "processing"; // COD starts processing immediately
  }

  await prisma.customer_order.update({
    where: { id: orderId },
    data: { status: updatedOrderStatus },
  });

  console.log(`✅ Payment recorded successfully for Order ${orderId}. Method: ${method}, Status: ${status}`);

  res.status(201).json({
    message: "Payment successfully recorded!",
    payment,
  });
});

module.exports = {
  createPaymentIntent,
  recordPayment,
};
