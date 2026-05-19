// Reset user password
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // Get email and new password from command line arguments
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log("❌ Please provide email and new password.");
      console.log("Usage: node resetPassword.js <email> <new_password>\n");
      console.log("Example: node resetPassword.js admin@arslanelectronics.com AdminPassword123\n");
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${email}...\n`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.log(`❌ User with email "${email}" not found.`);
      console.log('💡 Run "node listUsers.js" to see all available users.\n');
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
    });

    console.log("✅ SUCCESS! Password has been reset! 🔐\n");
    console.log("User Details:");
    console.log("─".repeat(50));
    console.log(`  Email:    ${updatedUser.email}`);
    console.log(`  Role:     ${updatedUser.role}`);
    console.log(`  Password: ${newPassword}`);
    console.log("─".repeat(50));
    console.log("\n🎉 You can now login with the new password!\n");
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
