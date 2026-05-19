import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.customer_order.findMany({
        skip,
        take: limit,
        orderBy: { dateTime: 'desc' }
      }),
      prisma.customer_order.count()
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simplified validation for migration
    if (!body.email || !body.total) {
      return NextResponse.json({ error: "Email and total are required" }, { status: 400 });
    }

    const order = await prisma.customer_order.create({
      data: {
        name: body.name,
        lastname: body.lastname,
        phone: body.phone,
        email: body.email,
        company: body.company || "",
        adress: body.adress,
        apartment: body.apartment || "",
        postalCode: body.postalCode,
        status: body.status || "confirmed",
        city: body.city,
        country: body.country,
        orderNotice: body.orderNotice || "",
        total: body.total,
        dateTime: new Date()
      },
    });

    return NextResponse.json({
      id: order.id,
      message: "Order created successfully",
      orderNumber: order.id
    }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
