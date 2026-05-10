import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Error searching products" }, { status: 500 });
  }
}
