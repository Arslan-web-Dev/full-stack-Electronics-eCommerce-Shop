// *********************
// Role of the component: Product item component 
// Name of the component: ProductItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component that contains product image, title, link to the single product page, price, button...
// *********************

import Image from "next/image";
import React from "react";
import Link from "next/link";

import { sanitize } from "@/lib/sanitize";

const getProductImageSrc = (image?: string) => {
  if (!image) return "/product_placeholder.jpg";
  return image.startsWith("http") || image.startsWith("/") ? image : `/${image}`;
};

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
  return (
    <div className="group relative flex flex-col items-center gap-y-4 p-6 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 glass-effect w-full max-w-[320px]">
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
        <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <Image
            src={getProductImageSrc(product.mainImage)}
            width={240}
            height={240}
            className="object-contain transition-transform duration-700 group-hover:scale-110"
            alt={sanitize(product?.title) || "Product image"}
          />
        </Link>
        {/* Quick action badge */}
        <div className="absolute top-4 right-4 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            New
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center text-center gap-y-1 w-full">
        <Link
          href={`/product/${product.slug}`}
          className="text-lg text-slate-800 font-bold uppercase tracking-tight line-clamp-1 hover:text-primary-600 transition-colors"
        >
          {sanitize(product.title)}
        </Link>
        <p className="text-2xl text-primary-600 font-black">
          ${product.price}
        </p>
      </div>

      <Link
        href={`/product/${product?.slug}`}
        className="w-full flex justify-center items-center gap-x-2 py-3 rounded-xl bg-slate-900 text-white font-bold transition-all hover:bg-primary-600 shadow-md active:scale-95"
      >
        <span>View product</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
};

export default ProductItem;
