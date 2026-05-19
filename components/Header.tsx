"use client";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import HeaderTop from "./HeaderTop";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import CartElement from "./CartElement";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useAuthStore } from "@/app/_zustand/authStore";
import apiClient from "@/lib/api";

const Header = () => {
  const pathname = usePathname();
  const { wishlist, setWishlist, wishQuantity } = useWishlistStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (e) {
      console.warn("Logout endpoint call failed:", e);
    }
    logout();
    toast.success("Logout successful!");
    window.location.href = "/";
  };

  // getting all wishlist items by user id
  const getWishlistByUserId = async (id: string) => {
    try {
      const response = await apiClient.get(`/api/wishlist/${id}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const wishlistData = await response.json();
        const productArray: {
          id: string;
          title: string;
          price: number;
          image: string;
          slug: string;
          stockAvailabillity: number;
        }[] = [];

        wishlistData.forEach((item: any) => {
          if (item?.product) {
            productArray.push({
              id: item.product.id,
              title: item.product.title,
              price: item.product.price,
              image: item.product.mainImage,
              slug: item.product.slug,
              stockAvailabillity: item.product.inStock,
            });
          }
        });
        
        setWishlist(productArray);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getWishlistByUserId(user.id);
    }
  }, [isAuthenticated, user?.id, wishlist.length]);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <HeaderTop />
      {pathname.startsWith("/admin") === false && (
        <div className="glass-effect h-24 flex items-center justify-between px-16 max-md:px-6 max-lg:flex-col max-lg:gap-y-4 max-lg:justify-center max-lg:h-auto max-lg:py-4 max-w-screen-2xl mx-auto rounded-b-2xl mt-0 shadow-lg border-t-0">
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-x-2">
            <span className="text-3xl font-black tracking-tighter text-slate-900">
              ARSLAN <span className="text-blue-600">ELECTRONICS</span>
            </span>
          </Link>
          <div className="flex-1 max-w-2xl mx-10 max-lg:mx-0 max-lg:w-full">
            <SearchInput />
          </div>
          <div className="flex gap-x-8 items-center">
            <nav className="hidden lg:flex gap-x-6 mr-4 font-semibold text-slate-700">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
              {user?.role === "admin" && (
                <>
                  <Link href="/control-panel" className="hover:text-blue-600 transition-colors text-red-600 font-bold">Control Panel</Link>
                  <Link href="/admin" className="hover:text-blue-600 transition-colors text-red-600">Admin Dashboard</Link>
                </>
              )}
              {isAuthenticated && (
                <Link href="/buyer-dashboard" className="hover:text-blue-600 transition-colors text-blue-600">My Dashboard</Link>
              )}
              <Link href="/creator" className="hover:text-blue-600 transition-colors text-purple-600">Meet Creator</Link>
            </nav>
            <NotificationBell />
            <HeartElement wishQuantity={wishQuantity} />
            <CartElement />
          </div>
        </div>
      )}
      {pathname.startsWith("/admin") === true && (
        <div className="flex justify-between h-32 bg-white items-center px-16 max-[1320px]:px-10  max-w-screen-2xl mx-auto max-[400px]:px-5 border-b border-gray-100 shadow-sm">
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-x-2">
            <span className="text-3xl font-black tracking-tighter text-slate-900">
              ARSLAN <span className="text-blue-600">ELECTRONICS</span>
            </span>
          </Link>
          <div className="flex gap-x-5 items-center">
            <NotificationBell />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="w-10 h-10 border border-gray-200 rounded-full overflow-hidden shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all">
                <Image
                  src="/randomuser.jpg"
                  alt="profile photo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-xl bg-white rounded-box w-52 border border-gray-100 mt-2"
              >
                <li>
                  <Link href="/admin" className="font-semibold text-slate-700">Admin Panel</Link>
                </li>
                <li>
                  <Link href="/buyer-dashboard" className="font-semibold text-slate-700">Buyer Dashboard</Link>
                </li>
                <li onClick={handleLogout}>
                  <button className="font-semibold text-red-600">Logout</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

