"use client";

import React, { useEffect, useState } from "react";
import { 
  FaArrowUp, 
  FaShoppingBag, 
  FaUserCircle, 
  FaTicketAlt, 
  FaStar, 
  FaCheck, 
  FaTrashAlt,
  FaCoins,
  FaPlus,
  FaEye,
  FaInfoCircle
} from "react-icons/fa";
import toast from "react-hot-toast";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";

interface Coupon {
  code: string;
  discount: number;
  status: "ACTIVE" | "EXPIRED";
  expiresAt: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  productTitle: string;
  status: "APPROVED" | "PENDING";
}

const AdminDashboardPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "coupons" | "reviews">("analytics");

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: "ARSLAN20", discount: 20, status: "ACTIVE", expiresAt: "2026-12-31" },
    { code: "WELCOME20", discount: 20, status: "ACTIVE", expiresAt: "2026-06-30" },
    { code: "DISCOUNT10", discount: 10, status: "ACTIVE", expiresAt: "2026-09-15" },
    { code: "ELECTRONICS5", discount: 5, status: "EXPIRED", expiresAt: "2026-05-01" },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([
    { id: "1", author: "Zainab Malik", rating: 5, comment: "Absolutely brilliant phone! Super fast delivery.", productTitle: "iPhone 15 Pro Max", status: "PENDING" },
    { id: "2", author: "Kamran Khan", rating: 4, comment: "Excellent sound quality, slightly heavy on bass.", productTitle: "Sony WH-1000XM5", status: "APPROVED" },
    { id: "3", author: "Mariam Bilal", rating: 2, comment: "Battery life is not as advertised. Disappointed.", productTitle: "Smart Watch Ultra", status: "PENDING" },
    { id: "4", author: "Ahmed Raza", rating: 5, comment: "Crisp display and amazing responsiveness.", productTitle: "Samsung Odyssey G9", status: "APPROVED" },
  ]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCouponCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a valid coupon code");
      return;
    }
    if (coupons.some((c) => c.code === code)) {
      toast.error("Coupon code already exists!");
      return;
    }
    const newCoupon: Coupon = {
      code,
      discount: newCouponDiscount,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    setCoupons([newCoupon, ...coupons]);
    setNewCouponCode("");
    toast.success(`Promo coupon ${code} created successfully!`);
  };

  const handleGenerateRandomCoupon = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "ELEC-";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCouponCode(code);
    toast.success(`Generated code: ${code}`);
  };

  const handleApproveReview = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    toast.success("Review approved for display!");
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
    toast.error("Review moderated and deleted.");
  };

  return (
    <div className="bg-slate-50 min-h-screen flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      
      <div className="flex-1 p-8 max-md:p-4 space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-y-3">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Arslan Store Administration</h1>
            <p className="text-sm text-gray-500">Monitor warehouse sales, moderate content, and control promo coupons.</p>
          </div>
          
          {/* Quick Sub-Navigation Menu */}
          <div className="flex space-x-2 bg-white p-1.5 rounded-xl border shadow-sm">
            <button
              onClick={() => setActiveSubTab("analytics")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeSubTab === "analytics"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-slate-50"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSubTab("coupons")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeSubTab === "coupons"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-slate-50"
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setActiveSubTab("reviews")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeSubTab === "reviews"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-slate-50"
              }`}
            >
              Reviews ({reviews.filter(r => r.status === "PENDING").length})
            </button>
          </div>
        </div>

        {/* Tab 1: Analytics Dashboard */}
        {activeSubTab === "analytics" && (
          <div className="space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-blue-600">
                  <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Gross Sales</span>
                  <FaCoins className="text-xl" />
                </div>
                <span className="text-3xl font-black text-gray-900 block">$45,230</span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-x-1">
                  <FaArrowUp /> +14.2% since last month
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-indigo-600">
                  <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Store Visitors</span>
                  <FaUserCircle className="text-xl" />
                </div>
                <span className="text-3xl font-black text-gray-900 block">1,200</span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-x-1">
                  <FaArrowUp /> +12.5% since last week
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-purple-600">
                  <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Pending Orders</span>
                  <FaShoppingBag className="text-xl" />
                </div>
                <span className="text-3xl font-black text-gray-900 block">14 Items</span>
                <span className="text-xs text-indigo-600 font-bold">Awaiting processing</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Promo Coupons</span>
                  <FaTicketAlt className="text-xl" />
                </div>
                <span className="text-3xl font-black text-gray-900 block">{coupons.filter(c => c.status === "ACTIVE").length} Active</span>
                <span className="text-xs text-gray-400 font-semibold">Active marketing campaigns</span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales SVG Line Chart (Left 2 cols) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-gray-900">Gross Monthly Revenues ($)</h3>
                
                {/* SVG Area */}
                <div className="w-full h-64 relative bg-slate-50 rounded-xl p-4">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#e2e8f0" strokeDasharray="4"/>
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" strokeDasharray="4"/>
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#e2e8f0" strokeDasharray="4"/>
                    <line x1="0" y1="160" x2="500" y2="160" stroke="#e2e8f0" strokeDasharray="4"/>

                    {/* Gradient Area under line */}
                    <path
                      d="M0,200 L0,120 L100,140 L200,90 L300,110 L400,60 L500,40 L500,200 Z"
                      fill="url(#chartGrad)"
                    />
                    
                    {/* Glowing Stroke Line */}
                    <path
                      d="M0,120 L100,140 L200,90 L300,110 L400,60 L500,40"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Points Circles */}
                    <circle cx="0" cy="120" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="100" cy="140" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="200" cy="90" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="300" cy="110" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="400" cy="60" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="500" cy="40" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2"/>
                  </svg>

                  {/* Chart Tooltips / Labels */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2 text-[10px] text-gray-400 font-bold">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun (Current)</span>
                  </div>
                </div>
              </div>

              {/* Product Category Distribution Donut Chart (Right 1 col) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-gray-900">Category Share</h3>
                
                {/* Custom Styled Donut layout */}
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* SVG Donut Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="54"
                        stroke="#e2e8f0"
                        strokeWidth="14"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="54"
                        stroke="#3b82f6"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray="339"
                        strokeDashoffset="120"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="54"
                        stroke="#818cf8"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray="339"
                        strokeDashoffset="260"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-gray-900">65%</span>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Smartphones</span>
                    </div>
                  </div>

                  <div className="w-full space-y-2 text-xs font-bold text-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-650 inline-block bg-blue-600" /> Smartphones</span>
                      <span>65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> Laptops</span>
                      <span>23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Audio Accessories</span>
                      <span>12%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Coupons Management */}
        {activeSubTab === "coupons" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Generate / Add Coupon Form */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
              <h3 className="text-lg font-black text-gray-900 border-b pb-2">Generate Marketing Promo</h3>
              
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase">Promo Coupon Code</label>
                  <div className="flex gap-x-2 mt-1.5">
                    <input
                      type="text"
                      placeholder="e.g. ELECTRONICS30"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateRandomCoupon}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold"
                      title="Generate random code"
                    >
                      Random
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase">Discount Rate (%)</label>
                  <select
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm"
                  >
                    <option value={5}>5% Discount</option>
                    <option value={10}>10% Discount</option>
                    <option value={15}>15% Discount</option>
                    <option value={20}>20% Discount</option>
                    <option value={30}>30% Discount</option>
                    <option value={50}>50% Discount (Mega!)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors flex justify-center items-center gap-x-2"
                >
                  <FaPlus className="text-xs" />
                  <span>Activate Promo Code</span>
                </button>
              </form>
            </div>

            {/* Coupons List Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-900 border-b pb-2">Active Promo Codes Inventory</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-gray-500">
                      <th className="py-2.5 px-4 font-bold">Coupon Code</th>
                      <th className="py-2.5 px-4 font-bold text-center">Discount Percentage</th>
                      <th className="py-2.5 px-4 font-bold">Expiration Date</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-black text-gray-900 flex items-center gap-x-2">
                          <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                            <FaTicketAlt />
                          </span>
                          <span>{coupon.code}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">
                          {coupon.discount}% Off
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-semibold">{coupon.expiresAt}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            coupon.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}>
                            {coupon.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Reviews Moderation */}
        {activeSubTab === "reviews" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-black text-gray-900">User Ratings & Reviews Moderation</h3>
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-x-1.5">
                <FaInfoCircle /> Pending reviews require manual validation before storefront listing.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-gray-500">
                    <th className="py-2.5 px-4 font-bold">Author</th>
                    <th className="py-2.5 px-4 font-bold">Product Item</th>
                    <th className="py-2.5 px-4 font-bold text-center">Score Rating</th>
                    <th className="py-2.5 px-4 font-bold">Review Description</th>
                    <th className="py-2.5 px-4 font-bold">Status</th>
                    <th className="py-2.5 px-4 font-bold text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-b hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{review.author}</td>
                      <td className="py-3.5 px-4 text-gray-600 font-semibold">{review.productTitle}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center text-amber-500 gap-x-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? "text-amber-500" : "text-slate-200"} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate" title={review.comment}>
                        {review.comment}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          review.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {review.status === "PENDING" && (
                            <button
                              onClick={() => handleApproveReview(review.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded border border-emerald-200"
                              title="Approve for Storefront"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded border border-rose-200"
                            title="Delete Review"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboardPage;
