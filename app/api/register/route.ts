import prisma from "@/utils/db";
import { NextResponse } from "next/server";
import { handleApiError, AppError } from "@/utils/errorHandler";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, email, role = "user" } = body;

    if (!id || !email) {
      throw new AppError("User ID and email are required", 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("Email is already in use", 400);
    }

    const newUser = await prisma.user.create({
      data: {
        id,
        email,
        role,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "User record created successfully",
        userId: newUser.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
