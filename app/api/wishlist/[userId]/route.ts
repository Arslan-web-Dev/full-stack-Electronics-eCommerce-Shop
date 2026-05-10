import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: params.userId },
      include: {
        product: true
      }
    });
    return NextResponse.json(wishlist);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
