"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AddNewProduct = () => {
  const router = useRouter();
  const [product, setProduct] = useState<{
    merchantId?: string;
    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    mainImage: string;
    description: string;
    slug: string;
    categoryId: string;
  }>({
    merchantId: "",
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<{
    merchantId?: string;
    title?: string;
    price?: string;
    manufacturer?: string;
    slug?: string;
    description?: string;
    categoryId?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!product.merchantId) {
      newErrors.merchantId = "Merchant is required";
    }
    if (!product.title || product.title.trim() === "") {
      newErrors.title = "Product name is required";
    }
    if (!product.price || product.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!product.manufacturer || product.manufacturer.trim() === "") {
      newErrors.manufacturer = "Manufacturer is required";
    }
    if (!product.slug || product.slug.trim() === "") {
      newErrors.slug = "Slug is required";
    }
    if (!product.description || product.description.trim() === "") {
      newErrors.description = "Description is required";
    }
    if (!product.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addProduct = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSaving(true);
    try {
      // Sanitize form data before sending to API
      const sanitizedProduct = sanitizeFormData(product);

      const response = await apiClient.post(`/api/products`, sanitizedProduct);

      if (response.status === 201) {
        const data = await response.json();
        toast.success("Product added successfully");
        // Reset form
        setProduct({
          merchantId: merchants[0]?.id || "",
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          mainImage: "",
          description: "",
          slug: "",
          categoryId: categories[0]?.id || "",
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchMerchants = async () => {
    try {
      const res = await apiClient.get("/api/merchants");
      const data: Merchant[] = await res.json();
      setMerchants(data || []);
      setProduct((prev) => ({
        ...prev,
        merchantId: prev.merchantId || data?.[0]?.id || "",
      }));
    } catch (e) {
      toast.error("Failed to load merchants");
    }
  };

  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Image uploaded successfully");
      } else {
        toast.error("File upload unsuccessful");
      }
    } catch (error) {
      console.error("Error happened while sending request:", error);
      toast.error("Error uploading file");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get(`/api/categories`);
      const data = await res.json();
      setCategories(data);
      setProduct((prev) => ({
        ...prev,
        categoryId: prev.categoryId || data[0]?.id || "",
      }));
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchMerchants()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
        <DashboardSidebar />
        <div className="flex items-center justify-center w-full">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Add New Product</h1>
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
          >
            ← Back
          </button>
        </div>

        {/* Merchant Selection */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Merchant:</span>
            </div>
            <select
              className={`select select-bordered ${errors.merchantId ? 'select-error' : ''}`}
              value={product?.merchantId}
              onChange={(e) => {
                setProduct({ ...product, merchantId: e.target.value });
                setErrors({ ...errors, merchantId: undefined });
              }}
            >
              <option value="">Select a merchant</option>
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
            {errors.merchantId && <span className="text-error text-xs mt-1">{errors.merchantId}</span>}
            {merchants.length === 0 && (
              <span className="text-xs text-warning mt-1">
                Please create a merchant first.
              </span>
            )}
          </label>
        </div>

        {/* Product Name */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Product name:</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full max-w-xs ${errors.title ? 'input-error' : ''}`}
              value={product?.title}
              onChange={(e) => {
                setProduct({ ...product, title: e.target.value });
                setErrors({ ...errors, title: undefined });
              }}
              placeholder="Enter product name"
            />
            {errors.title && <span className="text-error text-xs mt-1">{errors.title}</span>}
          </label>
        </div>

        {/* Product Slug */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Product slug:</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full max-w-xs ${errors.slug ? 'input-error' : ''}`}
              value={convertSlugToURLFriendly(product?.slug)}
              onChange={(e) => {
                setProduct({
                  ...product,
                  slug: convertSlugToURLFriendly(e.target.value),
                });
                setErrors({ ...errors, slug: undefined });
              }}
              placeholder="product-url-slug"
            />
            {errors.slug && <span className="text-error text-xs mt-1">{errors.slug}</span>}
          </label>
        </div>

        {/* Category Selection */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Category:</span>
            </div>
            <select
              className={`select select-bordered ${errors.categoryId ? 'select-error' : ''}`}
              value={product?.categoryId}
              onChange={(e) => {
                setProduct({ ...product, categoryId: e.target.value });
                setErrors({ ...errors, categoryId: undefined });
              }}
            >
              <option value="">Select a category</option>
              {categories &&
                categories.map((category: any) => (
                  <option key={category?.id} value={category?.id}>
                    {category?.name}
                  </option>
                ))}
            </select>
            {errors.categoryId && <span className="text-error text-xs mt-1">{errors.categoryId}</span>}
          </label>
        </div>

        {/* Product Price */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Product price:</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`input input-bordered w-full max-w-xs ${errors.price ? 'input-error' : ''}`}
              value={product?.price}
              onChange={(e) => {
                setProduct({ ...product, price: Number(e.target.value) });
                setErrors({ ...errors, price: undefined });
              }}
              placeholder="0.00"
            />
            {errors.price && <span className="text-error text-xs mt-1">{errors.price}</span>}
          </label>
        </div>

        {/* Manufacturer */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Manufacturer:</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full max-w-xs ${errors.manufacturer ? 'input-error' : ''}`}
              value={product?.manufacturer}
              onChange={(e) => {
                setProduct({ ...product, manufacturer: e.target.value });
                setErrors({ ...errors, manufacturer: undefined });
              }}
              placeholder="Manufacturer name"
            />
            {errors.manufacturer && <span className="text-error text-xs mt-1">{errors.manufacturer}</span>}
          </label>
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Stock quantity:</span>
            </div>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full max-w-xs"
              value={product?.inStock}
              onChange={(e) =>
                setProduct({ ...product, inStock: Number(e.target.value) })
              }
              placeholder="1"
            />
          </label>
        </div>

        {/* Main Image Upload */}
        <div>
          <label className="form-control w-full max-w-sm">
            <div className="label">
              <span className="label-text font-semibold">Main image:</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered file-input-lg w-full"
              onChange={(e: any) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  uploadFile(selectedFile);
                  setProduct({ ...product, mainImage: selectedFile.name });
                }
              }}
            />
          </label>
          {product?.mainImage && (
            <div className="mt-2">
              <Image
                src={`/` + product?.mainImage}
                alt={product?.title}
                className="w-auto h-auto rounded-lg shadow"
                width={100}
                height={100}
              />
            </div>
          )}
        </div>

        {/* Product Description */}
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text font-semibold">Product description:</span>
            </div>
            <textarea
              className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`}
              value={product?.description}
              onChange={(e) => {
                setProduct({ ...product, description: e.target.value });
                setErrors({ ...errors, description: undefined });
              }}
              placeholder="Enter product description..."
            ></textarea>
            {errors.description && <span className="text-error text-xs mt-1">{errors.description}</span>}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-x-4 max-sm:flex-col pt-4 border-t">
          <button
            onClick={addProduct}
            type="button"
            disabled={isSaving}
            className="uppercase bg-blue-500 px-10 py-3 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Adding...
              </span>
            ) : (
              "Add Product"
            )}
          </button>
          <button
            onClick={() => router.back()}
            type="button"
            disabled={isSaving}
            className="uppercase bg-gray-500 px-10 py-3 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
