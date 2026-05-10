import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        products: true,
      },
    });
    return NextResponse.json(merchants);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Error fetching merchants" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, description, status } = body;

    const merchant = await prisma.merchant.create({
      data: {
        name,
        email,
        phone,
        address,
        description,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(merchant, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Error creating merchant" }, { status: 500 });
  }
}
