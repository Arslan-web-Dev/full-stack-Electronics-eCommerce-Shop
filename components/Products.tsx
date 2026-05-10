
import React from "react";
import ProductItem from "./ProductItem";
import prisma from "@/lib/prisma";

const Products = async ({ params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }) => {
  // getting all data from URL slug and preparing everything for sending GET request
  const inStockNum = searchParams?.inStock === "true" ? 1 : 0;
  const outOfStockNum = searchParams?.outOfStock === "true" ? 1 : 0;
  const page = searchParams?.page ? Number(searchParams?.page) : 1;

  let stockMode: string = "lte";
  
  // preparing inStock and out of stock filter for GET request
  // If in stock checkbox is checked, stockMode is "equals"
  if (inStockNum === 1) {
    stockMode = "equals";
  }
 // If out of stock checkbox is checked, stockMode is "lt"
  if (outOfStockNum === 1) {
    stockMode = "lt";
  }
   // If in stock and out of stock checkboxes are checked, stockMode is "lte"
  if (inStockNum === 1 && outOfStockNum === 1) {
    stockMode = "lte";
  }
   // If in stock and out of stock checkboxes aren't checked, stockMode is "gt"
  if (inStockNum === 0 && outOfStockNum === 0) {
    stockMode = "gt";
  }

  let products: any[] = [];

  try {
    const priceLimit = Number(searchParams?.price) || 3000;
    const ratingLimit = Number(searchParams?.rating) || 0;
    const categoryName = params?.slug?.[0] || "";

    const where: any = {
      price: { lte: priceLimit },
      rating: { gte: ratingLimit },
    };

    // Stock filtering
    if (inStockNum === 1 && outOfStockNum === 0) {
      where.inStock = { gt: 0 };
    } else if (outOfStockNum === 1 && inStockNum === 0) {
      where.inStock = { equals: 0 };
    }

    // Category filtering
    if (categoryName) {
      where.category = { name: categoryName };
    }

    // Sorting
    const sort: any = {};
    const sortBy = searchParams?.sort || "defaultSort";
    switch (sortBy) {
      case "titleAsc": sort.title = "asc"; break;
      case "titleDesc": sort.title = "desc"; break;
      case "lowPrice": sort.price = "asc"; break;
      case "highPrice": sort.price = "desc"; break;
    }

    products = await prisma.product.findMany({
      where,
      skip: (page - 1) * 12,
      take: 12,
      orderBy: sort,
      include: {
        category: { select: { name: true } }
      }
    });
  } catch (error) {
    console.error('Error fetching products in Products component:', error);
    products = [];
  }

  return (
    <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
      {products.length > 0 ? (
        products.map((product: any) => (
          <ProductItem key={product.id} product={product} color="black" />
        ))
      ) : (
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
          No products found for specified query
        </h3>
      )}
    </div>
  );
};

export default Products;

