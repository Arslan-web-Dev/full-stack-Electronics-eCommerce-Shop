// *********************
// Role of the component: products section intended to be on the home page
// Name of the component: ProductsSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductsSection slug={slug} />
// Input parameters: no input parameters
// Output: products grid
// *********************

import React from "react";
import ProductItem from "./ProductItem";
import Heading from "./Heading";
import apiClient from "@/lib/api";

const ProductsSection = async () => {
  let products = [];
  
  try {
    // sending API request for getting all products
    const data = await apiClient.get("/api/products");
    
    if (!data.ok) {
      console.error('Failed to fetch products:', data.statusText);
      products = [];
    } else {
      const result = await data.json();
      // Ensure products is an array
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    products = [];
  }

  return (
    <div className="bg-slate-50 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-100/30 rounded-full blur-[120px]"></div>
      
      <div className="max-w-screen-2xl mx-auto pt-24 pb-20 relative z-10">
        <div className="px-10 mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase border-l-8 border-primary-500 pl-6">
            FEATURED <span className="text-primary-600">PRODUCTS</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl">
            Explore our handpicked selection of top-tier electronics designed to elevate your tech experience.
          </p>
        </div>

        <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto py-10 gap-x-8 px-10 gap-y-12 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          {products.length > 0 ? (
            products.map((product: any) => (
              <ProductItem key={product.id} product={product} color="black" />
            ))
          ) : (
            <div className="col-span-full text-center text-slate-400 py-20 bg-white rounded-3xl shadow-inner w-full border-2 border-dashed border-slate-200">
              <p className="text-xl font-medium">No products available at the moment.</p>
              <p className="mt-2 text-slate-400">Check back later for exciting new arrivals!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
