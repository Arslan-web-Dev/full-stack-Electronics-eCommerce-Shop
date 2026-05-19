import { ProductItem, SectionTitle } from "@/components";
import React from "react";
import prisma from "@/lib/prisma";
import { sanitize } from "@/lib/sanitize";

interface Props {
  searchParams: { search: string };
}


const SearchPage = async ({ searchParams }: Props) => {
  const sp = await searchParams;
  let products: any[] = [];
  const searchQuery = sp?.search || "";

  try {
    if (searchQuery) {
      products = await prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        include: {
          category: { select: { name: true } }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    products = [];
  }

  return (
    <div>
      <SectionTitle title="Search Page" path="Home | Search" />
      <div className="max-w-screen-2xl mx-auto">
        {sp?.search && (
          <h3 className="text-4xl text-center py-10 max-sm:text-3xl">
            Showing results for {sanitize(sp?.search)}
          </h3>
        )}
        <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
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
      </div>
    </div>
  );
};

export default SearchPage;

/*

*/
