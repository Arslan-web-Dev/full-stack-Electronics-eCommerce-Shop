import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      // If no productId, return all images (maybe for admin gallery)
      const images = await prisma.image.findMany();
      return NextResponse.json(images);
    }

    const images = await prisma.image.findMany({
      where: { productID: productId }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
