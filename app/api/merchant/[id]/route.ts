import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: params.id },
      include: { products: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    return NextResponse.json(merchant);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, description, status } = body;

    const merchant = await prisma.merchant.update({
      where: { id: params.id },
      data: { name, email, phone, address, description, status },
    });

    return NextResponse.json(merchant);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: params.id },
      include: { products: true },
    });

    if (merchant && merchant.products.length > 0) {
      return NextResponse.json({ error: "Cannot delete merchant with existing products" }, { status: 400 });
    }

    await prisma.merchant.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
