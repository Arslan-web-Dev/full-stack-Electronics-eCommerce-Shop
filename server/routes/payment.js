const express = require("express");
const router = express.Router();
const { createPaymentIntent, recordPayment } = require("../controllers/payment");
const { requireAuth } = require("../middleware/jwtAuth");

// Optionally require auth for payment operations
router.post("/create-intent", requireAuth, createPaymentIntent);
router.post("/record", requireAuth, recordPayment);

module.exports = router;
