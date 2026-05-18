"use client";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import { FaHeadphones, FaRegEnvelope, FaRegUser, FaSun, FaMoon } from "react-icons/fa6";
import { useAuthStore } from "@/app/_zustand/authStore";
import { useTheme } from "@/Providers";
import apiClient from "@/lib/api";

const HeaderTop = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

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

  return (
    <div className="h-10 text-white bg-slate-900 max-lg:px-5 max-lg:h-16 max-[573px]:px-0 border-b border-slate-800">
      <div className="flex justify-between h-full max-lg:flex-col max-lg:justify-center max-lg:items-center max-w-screen-2xl mx-auto px-12 max-[573px]:px-0">
        <ul className="flex items-center h-full gap-x-5 max-[370px]:text-sm max-[370px]:gap-x-2">
          <li className="flex items-center gap-x-2 font-semibold">
            <FaHeadphones className="text-white" />
            <a href="https://wa.me/923275541708" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
              +92 327 5541708
            </a>
          </li>
          <li className="flex items-center gap-x-2 font-semibold">
            <FaRegEnvelope className="text-white text-xl" />
            <span>arslan@arslanelectronics.com</span>
          </li>
        </ul>
        <ul className="flex items-center gap-x-5 h-full max-[370px]:text-sm max-[370px]:gap-x-2 font-semibold">
          <li className="flex items-center">
            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-x-2 text-slate-100 hover:text-blue-400 transition-colors focus:outline-none"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <FaSun className="text-yellow-400 text-lg" /> : <FaMoon className="text-indigo-400 text-lg" />}
              <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </li>
          {!isAuthenticated ? ( 
          <>
          <li className="flex items-center">
            <Link href="/login" className="flex items-center gap-x-2 font-semibold">
              <FaRegUser className="text-white" />
              <span>Login</span>
            </Link>
          </li>
          <li className="flex items-center">
            <Link href="/register" className="flex items-center gap-x-2 font-semibold">
              <FaRegUser className="text-white" />
              <span>Register</span>
            </Link>
          </li>
          </>
          ) :  (<>
          <span className="text-sm font-normal text-slate-300">{user?.email}</span>
          <li className="flex items-center">
            <button onClick={() => handleLogout()} className="flex items-center gap-x-2 font-semibold text-slate-100 hover:text-red-400 transition-colors">
              <FaRegUser className="text-white" />
              <span>Log out</span>
            </button>
          </li>
          </>)}
        </ul>
      </div>
    </div>
  );
};

export default HeaderTop;

