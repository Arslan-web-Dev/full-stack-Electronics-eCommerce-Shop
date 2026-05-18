import {
  StockAvailabillity,
  UrgencyText,

  ProductTabs,
  SingleProductDynamicFields,
  
} from "@/components";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";
import prisma from "@/lib/prisma";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaSquarePinterest } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

import { Metadata } from "next";

interface SingleProductPageProps {
  params: Promise<{  productSlug: string, id: string }>;
}

const getProductImageSrc = (image?: string) => {
  if (!image) return "/product_placeholder.jpg";
  return image.startsWith("http") || image.startsWith("/") ? image : `/${image}`;
};

export async function generateMetadata({ params }: SingleProductPageProps): Promise<Metadata> {
  const paramsAwaited = await params;
  const product = await prisma.product.findUnique({
    where: { slug: paramsAwaited.productSlug },
  });

  if (!product) {
    return {
      title: "Product Not Found | Arslan Electronics Store",
      description: "Discover a wide range of premium electronics, gadgets, and tech accessories at Arslan Electronics.",
    };
  }

  const cleanTitle = `${product.title} - Buy Online | Arslan Electronics`;
  const cleanDescription = product.description
    ? `${product.description.substring(0, 155).trim()}...`
    : `Buy the new premium ${product.title} at the best price online. Fast shipping, secure transactions, and premium warranty at Arslan Electronics.`;

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const imageSrc = product.mainImage
    ? (product.mainImage.startsWith("http") ? product.mainImage : `${baseUrl}/${product.mainImage}`)
    : `${baseUrl}/product_placeholder.jpg`;

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: `${baseUrl}/product/${product.slug}`,
      siteName: "Arslan Electronics",
      type: "website",
      images: [
        {
          url: imageSrc,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      images: [imageSrc],
    },
  };
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const paramsAwaited = await params;
  
  // Fetch product by slug directly from DB
  const product = await prisma.product.findUnique({
    where: { slug: paramsAwaited.productSlug },
    include: {
      category: true,
      merchant: true
    }
  });

  if (!product) {
    notFound();
  }

  // Fetch product images
  const images = await prisma.image.findMany({
    where: { productID: product.id }
  });

  if (!product) {
    notFound();
  }

  // Generate dynamic JSON-LD Product Schema
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const imageSrc = product.mainImage
    ? (product.mainImage.startsWith("http") ? product.mainImage : `${baseUrl}/${product.mainImage}`)
    : `${baseUrl}/product_placeholder.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": imageSrc,
    "description": product.description || `Buy ${product.title} at Arslan Electronics Karachi Hub at the best competitive price.`,
    "brand": {
      "@type": "Brand",
      "name": product.manufacturer || "Arslan Electronics"
    },
    "sku": `ELEC-${product.id.substring(0, 8)}`,
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": product.merchant?.name || "Arslan Electronics Karachi Hub"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "5.0",
      "reviewCount": "24"
    }
  };

  return (
    <div className="bg-white">
      {/* Inject Structured Search Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex justify-center gap-x-16 pt-10 max-lg:flex-col items-center gap-y-5 px-5">
          <div>
            <Image
              src={getProductImageSrc(product?.mainImage)}
              width={500}
              height={500}
              alt="main image"
              className="w-auto h-auto"
            />
            <div className="flex justify-around mt-5 flex-wrap gap-y-1 max-[500px]:justify-center max-[500px]:gap-x-1">
              {images?.map((imageItem: ImageItem, key: number) => (
                <Image
                  key={imageItem.imageID + key}
                  src={getProductImageSrc(imageItem.image)}
                  width={100}
                  height={100}
                  alt="laptop image"
                  className="w-auto h-auto"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-y-7 text-black max-[500px]:text-center">
        
            <h1 className="text-3xl">{sanitize(product?.title)}</h1>
            <p className="text-xl font-semibold">${product?.price}</p>
            <StockAvailabillity stock={94} inStock={product?.inStock} />
            <SingleProductDynamicFields product={product} />
            <div className="flex flex-col gap-y-2 max-[500px]:items-center">
             
              <p className="text-lg">
                SKU: <span className="ml-1">abccd-18</span>
              </p>
              <div className="text-lg flex gap-x-2">
                <span>Share:</span>
                <div className="flex items-center gap-x-1 text-2xl">
                  <FaSquareFacebook />
                  <FaSquareXTwitter />
                  <FaSquarePinterest />
                </div>
              </div>
              <div className="flex gap-x-2">
                <Image
                  src="/visa.svg"
                  width={50}
                  height={50}
                  alt="visa icon"
                  className="w-auto h-auto"
                />
                <Image
                  src="/mastercard.svg"
                  width={50}
                  height={50}
                  alt="mastercard icon"
                  className="h-auto w-auto"
                />
                <Image
                  src="/ae.svg"
                  width={50}
                  height={50}
                  alt="americal express icon"
                  className="h-auto w-auto"
                />
                <Image
                  src="/paypal.svg"
                  width={50}
                  height={50}
                  alt="paypal icon"
                  className="w-auto h-auto"
                />
                <Image
                  src="/dinersclub.svg"
                  width={50}
                  height={50}
                  alt="diners club icon"
                  className="h-auto w-auto"
                />
                <Image
                  src="/discover.svg"
                  width={50}
                  height={50}
                  alt="discover icon"
                  className="h-auto w-auto"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="py-16">
          <ProductTabs product={product} />
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
