import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has products
    const productsWithCategory = await prisma.product.findFirst({
      where: { categoryId: params.id },
    });

    if (productsWithCategory) {
      return NextResponse.json({ error: "Cannot delete category that has products" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
