
"use client";
import { nanoid } from "nanoid";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import toast from "react-hot-toast";

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, stockFilter]);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/api/products?mode=admin", { cache: "no-store" });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply stock filter
    if (stockFilter === "inStock") {
      filtered = filtered.filter((product) => product.inStock > 0);
    } else if (stockFilter === "outOfStock") {
      filtered = filtered.filter((product) => product.inStock === 0);
    }

    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === filteredProducts.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await apiClient.delete(`/api/products/${productId}`);
      if (response.status === 204) {
        toast.success("Product deleted successfully");
        await fetchProducts();
        setSelectedProducts(new Set());
        setSelectAll(false);
      } else if (response.status === 400) {
        toast.error("Cannot delete product due to foreign key constraint");
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
    }
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return;
    }

    try {
      const deletePromises = Array.from(selectedProducts).map((id) =>
        apiClient.delete(`/api/products/${id}`)
      );
      
      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter((r) => r.status !== 204);
      
      if (failedDeletes.length === 0) {
        toast.success(`${selectedProducts.size} products deleted successfully`);
      } else {
        toast.warning(`${failedDeletes.length} products could not be deleted (foreign key constraint)`);
      }
      
      await fetchProducts();
      setSelectedProducts(new Set());
      setSelectAll(false);
    } catch (error) {
      toast.error("Error during bulk delete");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-5">Product Management</h1>
      
      {/* Control Panel */}
      <div className="bg-gray-50 p-4 rounded-lg mb-5">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stock Filter */}
          <div className="flex gap-2">
            <select
              className="select select-bordered"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
            >
              <option value="all">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn btn-error btn-sm"
              >
                Delete Selected ({selectedProducts.size})
              </button>
            )}
            <Link href="/admin/products/new">
              <CustomButton
                buttonType="button"
                customWidth="140px"
                paddingX={10}
                paddingY={5}
                textSize="base"
                text="+ Add Product"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Products Count */}
      <div className="mb-4 text-gray-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Table */}
      <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[70vh]">
        <table className="table table-md table-pin-cols">
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </label>
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={nanoid()} className="hover">
                  <th>
                    <label>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </label>
                  </th>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image
                            width={48}
                            height={48}
                            src={product?.mainImage ? `/${product?.mainImage}` : "/product_placeholder.jpg"}
                            alt={sanitize(product?.title) || "Product image"}
                            className="w-auto h-auto"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{sanitize(product?.title)}</div>
                        <div className="text-sm opacity-50">
                          {sanitize(product?.manufacturer)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-ghost badge-sm">
                      {product.category?.name || "N/A"}
                    </span>
                  </td>

                  <td>
                    {product?.inStock > 0 ? (
                      <span className="badge badge-success text-white badge-sm">
                        In Stock ({product.inStock})
                      </span>
                    ) : (
                      <span className="badge badge-error text-white badge-sm">
                        Out of Stock
                      </span>
                    )}
                  </td>

                  <td className="font-semibold">${product?.price}</td>

                  <th>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setProductToDelete(product.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="btn btn-error btn-ghost btn-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </th>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm || stockFilter !== "all"
                      ? "No products match your filters"
                      : "No products found. Add your first product!"}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this product? This action cannot be undone.
              Note: You cannot delete products that are referenced in orders.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="btn"
              >
                Cancel
              </button>
              <button
                onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default DashboardProductTable;

