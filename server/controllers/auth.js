const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123456";
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || "refresh-super-secret-key-123456";

// Helper to exclude password
function excludePassword(user) {
  if (!user) return user;
  const { password, refreshToken, verificationToken, resetPasswordToken, resetPasswordExpires, ...cleanUser } = user;
  return cleanUser;
}

/**
 * Register a new User
 */
const signup = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Password length validation
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("Email is already registered", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: false,
      verificationToken,
    },
  });

  // Log verification link to server console for easy dev extraction
  const verifyLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/verify-email?token=${verificationToken}`;
  console.log("\n==================================================");
  console.log("📨 MOCK EMAIL VERIFICATION SENT!");
  console.log(`To: ${email}`);
  console.log(`Link: ${verifyLink}`);
  console.log("==================================================\n");

  res.status(201).json({
    message: "Registration successful! Please check your email/console to verify your account.",
    verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined,
    user: excludePassword(user),
  });
});

/**
 * Verify Email Token
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Verification token is required", 400);
  }

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  res.status(200).json({
    message: "Email successfully verified! You can now log in.",
  });
});

/**
 * Login User
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // Create JWT tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    REFRESH_JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Save refresh token in db
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  // Set cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

  res.status(200).json({
    message: "Logged in successfully!",
    accessToken,
    refreshToken,
    user: excludePassword(user),
  });
});

/**
 * Refresh JWT Token
 */
const refresh = asyncHandler(async (req, res) => {
  let token = req.body.refreshToken;

  // Extract from cookies if not in body
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.refreshToken;
  }

  if (!token) {
    throw new AppError("Refresh token is required", 401);
  }

  try {
    const decoded = jwt.verify(token, REFRESH_JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== token) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role || "user" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    throw new AppError("Expired or invalid refresh token", 401);
  }
});

/**
 * Forgot Password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return standard message to prevent user enumeration
    return res.status(200).json({
      message: "If that email exists, we have sent a reset password link.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiry

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;
  console.log("\n==================================================");
  console.log("📨 MOCK RESET PASSWORD EMAIL SENT!");
  console.log(`To: ${email}`);
  console.log(`Link: ${resetLink}`);
  console.log("==================================================\n");

  res.status(200).json({
    message: "Reset password link generated successfully! Check console.",
    resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
  });
});

/**
 * Reset Password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gte: new Date() },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  res.status(200).json({
    message: "Password successfully reset! You can now log in.",
  });
});

/**
 * Logout User
 */
const logout = asyncHandler(async (req, res) => {
  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  // Clear refresh token in database if verified
  let token = req.body.refreshToken;
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.refreshToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, REFRESH_JWT_SECRET);
      await prisma.user.update({
        where: { id: decoded.id },
        data: { refreshToken: null },
      });
    } catch (e) {
      // Ignore token verification errors during logout
    }
  }

  res.status(200).json({
    message: "Logged out successfully!",
  });
});

module.exports = {
  signup,
  verifyEmail,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  logout,
};
