"use client";
import { CustomButton, DashboardSidebar, SectionTitle } from "@/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import { nanoid } from "nanoid";
import apiClient from "@/lib/api";

interface DashboardProductDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardProductDetails = ({ params }: DashboardProductDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    price?: string;
    manufacturer?: string;
    slug?: string;
    description?: string;
    categoryId?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!product?.title || product.title.trim() === "") {
      newErrors.title = "Product name is required";
    }
    if (!product?.price || product.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!product?.manufacturer || product.manufacturer.trim() === "") {
      newErrors.manufacturer = "Manufacturer is required";
    }
    if (!product?.slug || product.slug.trim() === "") {
      newErrors.slug = "Slug is required";
    }
    if (!product?.description || product.description.trim() === "") {
      newErrors.description = "Description is required";
    }
    if (!product?.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // functionality for deleting product
  const deleteProduct = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.delete(`/api/products/${id}`);
      
      if (response.status === 204) {
        toast.success("Product deleted successfully");
        router.push("/admin/products");
      } else if (response.status === 400) {
        toast.error(
          "Cannot delete the product because of foreign key constraint"
        );
      } else {
        toast.error("There was an error while deleting product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("There was an error while deleting product");
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  // functionality for updating product
  const updateProduct = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiClient.put(`/api/products/${id}`, product);

      if (response.status === 200) {
        await response.json();
        toast.success("Product successfully updated");
        setErrors({});
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "There was an error while updating product"
        );
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("There was an error while updating product");
    } finally {
      setIsSaving(false);
    }
  };

  // functionality for uploading main image file
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
        toast.error("File upload unsuccessful.");
      }
    } catch (error) {
      console.error("There was an error while during request sending:", error);
      toast.error("There was an error during request sending");
    }
  };

  // fetching main product data including other product images
  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);

      const imagesData = await apiClient.get(`/api/images/${id}`, {
        cache: "no-store",
      });
      const images = await imagesData.json();
      setOtherImages(images);
    } catch (error) {
      toast.error("Failed to fetch product data");
    } finally {
      setIsLoading(false);
    }
  };

  // fetching all product categories. It will be used for displaying categories in select category input
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get(`/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [id]);

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
      <div className="flex flex-col gap-y-7 xl:ml-5 w-full max-xl:px-5">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Edit Product</h1>
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
          >
            ← Back
          </button>
        </div>

        {/* Product name input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Product name:</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full max-w-xs ${errors.title ? 'input-error' : ''}`}
              value={product?.title || ""}
              onChange={(e) => {
                setProduct({ ...product!, title: e.target.value });
                setErrors({ ...errors, title: undefined });
              }}
            />
            {errors.title && <span className="text-error text-xs mt-1">{errors.title}</span>}
          </label>
        </div>
        {/* Product name input div - end */}

        {/* Product price input div - start */}
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
              value={product?.price || ""}
              onChange={(e) => {
                setProduct({ ...product!, price: Number(e.target.value) });
                setErrors({ ...errors, price: undefined });
              }}
            />
            {errors.price && <span className="text-error text-xs mt-1">{errors.price}</span>}
          </label>
        </div>
        {/* Product price input div - end */}

        {/* Product manufacturer input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Manufacturer:</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full max-w-xs ${errors.manufacturer ? 'input-error' : ''}`}
              value={product?.manufacturer || ""}
              onChange={(e) => {
                setProduct({ ...product!, manufacturer: e.target.value });
                setErrors({ ...errors, manufacturer: undefined });
              }}
            />
            {errors.manufacturer && <span className="text-error text-xs mt-1">{errors.manufacturer}</span>}
          </label>
        </div>
        {/* Product manufacturer input div - end */}

        {/* Product slug input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Slug:</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full max-w-xs ${errors.slug ? 'input-error' : ''}`}
              value={
                product?.slug ? convertSlugToURLFriendly(product?.slug) : ""
              }
              onChange={(e) => {
                setProduct({
                  ...product!,
                  slug: convertSlugToURLFriendly(e.target.value),
                });
                setErrors({ ...errors, slug: undefined });
              }}
            />
            {errors.slug && <span className="text-error text-xs mt-1">{errors.slug}</span>}
          </label>
        </div>
        {/* Product slug input div - end */}

        {/* Product inStock select input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Stock quantity:</span>
            </div>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full max-w-xs"
              value={product?.inStock ?? 1}
              onChange={(e) => {
                setProduct({ ...product!, inStock: Number(e.target.value) });
              }}
            />
          </label>
        </div>
        {/* Product inStock select input div - end */}

        {/* Product category select input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-semibold">Category:</span>
            </div>
            <select
              className={`select select-bordered ${errors.categoryId ? 'select-error' : ''}`}
              value={product?.categoryId || ""}
              onChange={(e) => {
                setProduct({
                  ...product!,
                  categoryId: e.target.value,
                });
                setErrors({ ...errors, categoryId: undefined });
              }}
            >
              <option value="">Select a category</option>
              {categories &&
                categories.map((category: Category) => (
                  <option key={category?.id} value={category?.id}>
                    {formatCategoryName(category?.name)}
                  </option>
                ))}
            </select>
            {errors.categoryId && <span className="text-error text-xs mt-1">{errors.categoryId}</span>}
          </label>
        </div>
        {/* Product category select input div - end */}

        {/* Main image file upload div - start */}
        <div>
          <label className="form-control w-full max-w-sm">
            <div className="label">
              <span className="label-text font-semibold">Main image:</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered file-input-lg w-full"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  uploadFile(selectedFile);
                  setProduct({ ...product!, mainImage: selectedFile.name });
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
        {/* Main image file upload div - end */}

        {/* Other images file upload div - start */}
        {otherImages && otherImages.length > 0 && (
          <div>
            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Additional images:</span>
              </div>
            </label>
            <div className="flex gap-x-2 flex-wrap">
              {otherImages.map((image) => (
                <Image
                  src={`/${image.image}`}
                  key={nanoid()}
                  alt="product image"
                  width={100}
                  height={100}
                  className="w-auto h-auto rounded shadow"
                />
              ))}
            </div>
          </div>
        )}
        {/* Other images file upload div - end */}

        {/* Product description div - start */}
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text font-semibold">Product description:</span>
            </div>
            <textarea
              className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`}
              value={product?.description || ""}
              onChange={(e) => {
                setProduct({ ...product!, description: e.target.value });
                setErrors({ ...errors, description: undefined });
              }}
            ></textarea>
            {errors.description && <span className="text-error text-xs mt-1">{errors.description}</span>}
          </label>
        </div>
        {/* Product description div - end */}

        {/* Action buttons div - start */}
        <div className="flex gap-x-4 max-sm:flex-col pt-4 border-t">
          <button
            type="button"
            onClick={updateProduct}
            disabled={isSaving}
            className="uppercase bg-blue-500 px-10 py-3 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </span>
            ) : (
              "Update Product"
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSaving}
            className="uppercase bg-red-600 px-10 py-3 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Product
          </button>
        </div>
        {/* Action buttons div - end */}

        {/* Warning message */}
        <div className="alert alert-warning mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            To delete the product, you first need to delete all its records in orders (customer_order_product table).
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this product? This action cannot be undone.
              <br />
              <strong>Note:</strong> You cannot delete products that are referenced in orders.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={deleteProduct}
                className="btn btn-error"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowDeleteConfirm(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default DashboardProductDetails;
