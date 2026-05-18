const jwt = require("jsonwebtoken");
const prisma = require("../utills/db");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123456";

/**
 * Custom JWT Verification Middleware
 * Extracts JWT token from:
 * 1. Authorization header: "Bearer <token>"
 * 2. Cookie header: "accessToken=<token>"
 */
async function verifyJWTToken(req, res, next) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Check Cookie header
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.accessToken || cookies.token;
  }

  if (!token) {
    // Optional auth: let req.user stay empty, check in requireAuth
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Retrieve user from DB to verify they still exist and get updated details
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User associated with this token no longer exists" });
    }

    // Attach to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification failed:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired", expired: true });
    }
    return res.status(401).json({ error: "Invalid or tampered token" });
  }
}

/**
 * Require authentication middleware
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

/**
 * Require admin role middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
}

/**
 * Require email verification middleware
 */
function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ error: "Your email address is not verified yet" });
  }
  next();
}

module.exports = {
  verifyJWTToken,
  requireAuth,
  requireAdmin,
  requireVerified,
};
