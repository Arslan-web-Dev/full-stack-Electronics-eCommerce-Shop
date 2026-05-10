import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Allowed values for security
const ALLOWED_SORT_VALUES = ['defaultSort', 'titleAsc', 'titleDesc', 'lowPrice', 'highPrice'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "";
    const page = Number(searchParams.get("page")) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Admin mode: return all products without filters
    if (mode === "admin") {
      const adminProducts = await prisma.product.findMany({});
      return NextResponse.json(adminProducts);
    }

    // Parsing filters
    // Example: ?filters[price][$lte]=3000&filters[rating][$gte]=0
    const where: any = {};
    const sort: any = {};

    // Handling sorting
    const sortBy = searchParams.get("sort") || "defaultSort";
    switch (sortBy) {
      case "titleAsc": sort.title = "asc"; break;
      case "titleDesc": sort.title = "desc"; break;
      case "lowPrice": sort.price = "asc"; break;
      case "highPrice": sort.price = "desc"; break;
    }

    // Basic filters parsing (simplified for Next.js)
    searchParams.forEach((value, key) => {
      if (key.startsWith("filters")) {
        // Extract filter type and operator
        // key format: filters[type][$operator]
        const match = key.match(/filters\[(.*?)\]\[\$(.*?)\]/);
        if (match) {
          const [, type, operator] = match;
          
          if (type === 'category') {
            where.category = { name: { equals: value } };
          } else {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              where[type] = { ...where[type], [operator]: numValue };
            }
          }
        }
      }
    });

    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: sort
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
