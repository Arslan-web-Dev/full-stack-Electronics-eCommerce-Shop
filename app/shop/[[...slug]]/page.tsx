export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
  Breadcrumb,
  Filters,
  Pagination,
  Products,
  SortBy,
} from "@/components";
import { Metadata } from "next";
import { sanitize } from "@/lib/sanitize";

// improve readabillity of category text, for example category text "smart-watches" will be "smart watches"
const improveCategoryText = (text: string): string => {
  if (text.indexOf("-") !== -1) {
    let textArray = text.split("-");

    return textArray.join(" ");
  } else {
    return text;
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const awaitedParams = await params;
  const rawCategory = awaitedParams?.slug && awaitedParams.slug[0];
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (!rawCategory) {
    return {
      title: "Premium Electronics Catalog - Shop Online | Arslan Electronics",
      description: "Explore the vast catalog of premium laptops, smartphones, smart watches, gaming accessories, and premium audio gear at Arslan Electronics Karachi Hub.",
      alternates: {
        canonical: `${baseUrl}/shop`,
      }
    };
  }

  const categoryName = improveCategoryText(rawCategory);
  const capitalizedCategory = categoryName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const cleanTitle = `Best ${capitalizedCategory} - Price & Specs | Arslan Electronics`;
  const cleanDescription = `Discover the ultimate deals on premium ${categoryName} at Arslan Electronics. Check prices, specs, and features for top brand models with reliable warranty!`;

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `${baseUrl}/shop/${rawCategory}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: `${baseUrl}/shop/${rawCategory}`,
      siteName: "Arslan Electronics",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: cleanTitle,
      description: cleanDescription,
    }
  };
}

const ShopPage = async ({ params, searchParams }: { params: Promise<{ slug?: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  // Await both params and searchParams
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  
  return (
    <div className="text-black bg-white">
      <div className=" max-w-screen-2xl mx-auto px-10 max-sm:px-5">
        <Breadcrumb />
        <div className="grid grid-cols-[200px_1fr] gap-x-10 max-md:grid-cols-1 max-md:gap-y-5">
          <Filters />
          <div>
            <div className="flex justify-between items-center max-lg:flex-col max-lg:gap-y-5">
              <h2 className="text-2xl font-bold max-sm:text-xl max-[400px]:text-lg uppercase">
                {awaitedParams?.slug && awaitedParams?.slug[0]?.length > 0
                  ? sanitize(improveCategoryText(awaitedParams?.slug[0]))
                  : "All products"}
              </h2>

              <SortBy />
            </div>
            <div className="divider"></div>
            <Products params={awaitedParams} searchParams={awaitedSearchParams} />
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
