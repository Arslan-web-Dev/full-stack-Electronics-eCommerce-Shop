"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaTrashAlt, FaShoppingCart } from "react-icons/fa";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useProductStore } from "@/app/_zustand/store";
import { useAuthStore } from "@/app/_zustand/authStore";
import apiClient from "@/lib/api";

interface WishItemProps {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
}

const WishItem: React.FC<WishItemProps> = ({
  id,
  title,
  price,
  image,
  slug,
  stockAvailabillity,
}) => {
  const { removeFromWishlist } = useWishlistStore();
  const { addToCart, calculateTotals } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();

  const handleRemove = async () => {
    try {
      if (isAuthenticated && user?.id) {
        // Delete item from backend database
        const response = await apiClient.delete(`/api/wishlist/${user.id}/${id}`);
        if (!response.ok) {
          throw new Error("Failed to delete wishlist item from server");
        }
      }
      removeFromWishlist(id);
      toast.success("Item removed from your wishlist.");
    } catch (e) {
      console.error("Failed to remove item:", e);
      // Fallback local remove
      removeFromWishlist(id);
      toast.success("Item removed from local wishlist.");
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      title,
      price,
      image,
      amount: 1,
    });
    calculateTotals();
    toast.success(`${title} added to shopping cart! 🛒`);
  };

  return (
    <tr className="hover:bg-slate-50/50 border-b">
      <td>
        <button
          onClick={handleRemove}
          className="btn btn-ghost text-red-500 hover:text-red-700 p-2"
          title="Remove from wishlist"
        >
          <FaTrashAlt className="text-lg" />
        </button>
      </td>
      <td>
        <div className="flex items-center justify-center">
          <div className="relative w-16 h-16 rounded-xl border bg-gray-50 overflow-hidden shadow-inner">
            <Image
              src={image || "/randomuser.jpg"}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </td>
      <td className="text-left font-semibold text-gray-900 max-w-xs">
        <Link href={`/product/${slug}`} className="hover:text-indigo-600 transition-colors truncate block">
          {title}
        </Link>
        <span className="text-xs text-gray-500 block mt-1">${price}</span>
      </td>
      <td>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            stockAvailabillity > 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {stockAvailabillity > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </td>
      <td>
        <button
          onClick={handleAddToCart}
          disabled={stockAvailabillity <= 0}
          className="btn btn-indigo bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
        >
          <FaShoppingCart />
          <span>Add to Cart</span>
        </button>
      </td>
    </tr>
  );
};

export default WishItem;
