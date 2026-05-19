"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { 
  FaUser, 
  FaShoppingBag, 
  FaHeart, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaHome,
  FaPrint,
  FaArrowRight,
  FaShieldAlt
} from "react-icons/fa";
import { useAuthStore } from "../_zustand/authStore";
import { useWishlistStore } from "../_zustand/wishlistStore";
import { WishlistModule } from "@/components/modules/wishlist";
import apiClient from "@/lib/api";

const BuyerDashboardPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { wishlist } = useWishlistStore();

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "profile" | "wishlist">("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [profileForm, setProfileForm] = useState({
    name: "Customer",
    lastname: "",
    phone: "",
    adress: "",
    city: "",
    country: "",
    postalCode: "",
    avatar: "avatar1.png"
  });

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch orders from custom MERN backend
  const fetchUserOrders = async () => {
    if (!user?.email) return;
    setLoadingOrders(true);
    try {
      const response = await apiClient.get(`/api/orders/user/${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to load user orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchUserOrders();
      // Pre-fill profile form mock local values
      const names = user.email.split("@")[0];
      setProfileForm((prev) => ({
        ...prev,
        name: names.charAt(0).toUpperCase() + names.slice(1),
        adress: "123 Shahrah-e-Faisal",
        city: "Karachi",
        country: "Pakistan",
        postalCode: "75400",
        phone: "+92 300 1234567"
      }));
    }
  }, [isAuthenticated, user?.email]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const getStatusStep = (status: string) => {
    const statuses = ["pending", "processing", "shipped", "delivered"];
    return statuses.indexOf(status.toLowerCase());
  };

  const handlePrintReceipt = (order: any) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-solid"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0">
        
        {/* Printable Invoice View (hidden on screen, visible on print) */}
        {selectedOrder && (
          <div className="hidden print:block p-8 border border-gray-300 rounded-xl space-y-6 text-gray-900 bg-white">
            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900">ARSLAN ELECTRONICS</h1>
                <p className="text-sm text-gray-500">Premium E-Commerce Platform</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">INVOICE</h2>
                <p className="text-sm text-gray-600">Order ID: {selectedOrder.id}</p>
                <p className="text-sm text-gray-600">Date: {new Date(selectedOrder.dateTime || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-bold text-gray-800">Billed To:</h3>
                <p>{selectedOrder.name} {selectedOrder.lastname}</p>
                <p>{selectedOrder.adress}, {selectedOrder.apartment}</p>
                <p>{selectedOrder.city}, {selectedOrder.country} - {selectedOrder.postalCode}</p>
                <p>Phone: {selectedOrder.phone}</p>
                <p>Email: {selectedOrder.email}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-gray-800">Shipped From:</h3>
                <p>Arslan Electronics Warehousing</p>
                <p>Main Hub Office 12A</p>
                <p>Karachi, Pakistan</p>
                <p>support@arslanelectronics.com</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="py-2 px-4 font-bold">Product Item</th>
                  <th className="py-2 px-4 font-bold text-center">Quantity</th>
                  <th className="py-2 px-4 font-bold text-right">Unit Price</th>
                  <th className="py-2 px-4 font-bold text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.products?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-4">{item.product?.title || "Electronics Product"}</td>
                    <td className="py-2 px-4 text-center">{item.quantity}</td>
                    <td className="py-2 px-4 text-right">${item.product?.price || selectedOrder.total}</td>
                    <td className="py-2 px-4 text-right">${(item.product?.price || selectedOrder.total) * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.total}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-base text-gray-900">
                  <span>Grand Total:</span>
                  <span>${selectedOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 text-center text-xs text-gray-500">
              <p>Thank you for purchasing premium electronics from Arslan Electronics!</p>
              <p>This is a system-generated electronic receipt and does not require a physical signature.</p>
            </div>
          </div>
        )}

        {/* Screen Dashboard View */}
        <div className="print:hidden grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-indigo-100 shadow-inner">
                <Image 
                  src={`/randomuser.jpg`} 
                  alt="Avatar" 
                  fill 
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 font-black text-xl text-gray-900">{profileForm.name} {profileForm.lastname}</h3>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-1">{user?.role || "Verified Buyer"}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-around text-sm">
                <div>
                  <span className="block font-black text-lg text-gray-900">{orders.length}</span>
                  <span className="text-xs text-gray-400">Orders</span>
                </div>
                <div className="border-r border-gray-100" />
                <div>
                  <span className="block font-black text-lg text-gray-900">{wishlist.length}</span>
                  <span className="text-xs text-gray-400">Wishlist</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full py-4 px-6 text-left font-bold flex items-center space-x-3 transition-colors ${
                  activeTab === "overview" ? "bg-indigo-50/50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaHome className="text-lg" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full py-4 px-6 text-left font-bold flex items-center space-x-3 transition-colors ${
                  activeTab === "orders" ? "bg-indigo-50/50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaShoppingBag className="text-lg" />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full py-4 px-6 text-left font-bold flex items-center space-x-3 transition-colors ${
                  activeTab === "profile" ? "bg-indigo-50/50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUser className="text-lg" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full py-4 px-6 text-left font-bold flex items-center space-x-3 transition-colors ${
                  activeTab === "wishlist" ? "bg-indigo-50/50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaHeart className="text-lg text-rose-500 animate-pulse" />
                <span>My Wishlist</span>
              </button>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9">
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 space-y-3 max-w-xl">
                    <h2 className="text-3xl font-black">Welcome back, {profileForm.name}!</h2>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      Track your purchases, manage delivery locations, and view invoices in your secure buyer dashboard panel.
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <FaShoppingBag className="w-80 h-80" />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <FaShoppingBag className="text-2xl" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-semibold">Active Orders</span>
                      <span className="text-2xl font-black text-gray-900">{orders.filter(o => o.status !== "delivered").length} Items</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <FaCheckCircle className="text-2xl" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-semibold">Account Status</span>
                      <span className="text-2xl font-black text-gray-900">Verified</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                      <FaHeart className="text-2xl" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-semibold">Wishlist items</span>
                      <span className="text-2xl font-black text-gray-900">{wishlist.length} Items</span>
                    </div>
                  </div>
                </div>

                {/* Recent Order Preview */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-black text-lg text-gray-900">Recent Purchase History</h3>
                    <button onClick={() => setActiveTab("orders")} className="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center space-x-1">
                      <span>View All</span>
                      <FaArrowRight className="text-xs" />
                    </button>
                  </div>

                  {loadingOrders ? (
                    <p className="text-center py-6 text-gray-500">Loading your purchase records...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-center py-6 text-gray-500">No purchases found in your records.</p>
                  ) : (
                    <div className="divide-y">
                      {orders.slice(0, 2).map((order) => (
                        <div key={order.id} className="py-4 flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-y-3">
                          <div>
                            <span className="text-xs text-gray-400 block font-bold">ORDER ID: {order.id.slice(0, 10)}...</span>
                            <span className="font-bold text-gray-900 text-sm">{new Date(order.dateTime || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block font-bold">Total Amount</span>
                            <span className="font-black text-gray-950 text-base">${order.total}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block font-bold">Shipping Status</span>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                              order.status === "shipped" ? "bg-purple-100 text-purple-700" :
                              order.status === "processing" ? "bg-indigo-100 text-indigo-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setActiveTab("orders");
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
                          >
                            Track Order
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xl font-black text-gray-900 border-b pb-3">My Orders & Live Timeline</h3>

                  {loadingOrders ? (
                    <p className="text-center py-6 text-gray-500">Loading your purchase records...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-center py-6 text-gray-500">No purchase records found.</p>
                  ) : (
                    <div className="space-y-8">
                      {orders.map((order) => {
                        const currentStep = getStatusStep(order.status);
                        return (
                          <div key={order.id} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-6">
                            <div className="flex justify-between items-center border-b pb-4 max-sm:flex-col max-sm:items-start max-sm:gap-y-3">
                              <div>
                                <span className="text-xs font-bold text-gray-400 block">ORDER ID: {order.id}</span>
                                <span className="text-sm font-semibold text-gray-600">Placed on: {new Date(order.dateTime || Date.now()).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-xl font-black text-gray-950">${order.total}</span>
                                <button
                                  onClick={() => handlePrintReceipt(order)}
                                  className="p-2 border rounded-lg hover:bg-white text-gray-600 hover:text-indigo-600 transition-colors flex items-center space-x-1"
                                  title="Print invoice"
                                >
                                  <FaPrint />
                                  <span className="text-xs font-bold">Invoice</span>
                                </button>
                              </div>
                            </div>

                            {/* Live Timeline Visualization */}
                            <div className="py-6">
                              <h4 className="text-sm font-black text-gray-700 mb-6">Delivery Progress Timeline</h4>
                              
                              <div className="relative flex justify-between items-center w-full">
                                {/* Connector Line */}
                                <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded">
                                  <div 
                                    className="h-full bg-indigo-600 rounded transition-all duration-500" 
                                    style={{ width: `${(currentStep / 3) * 100}%` }}
                                  />
                                </div>

                                {/* Step 1: Pending */}
                                <div className="flex flex-col items-center text-center w-1/4">
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                                    currentStep >= 0 ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white border-gray-300 text-gray-400"
                                  }`}>
                                    {currentStep > 0 ? <FaCheckCircle className="text-xs" /> : <FaClock className="text-xs" />}
                                  </div>
                                  <span className="text-xs font-bold text-gray-800 mt-2 block">Pending</span>
                                  <span className="text-[10px] text-gray-400 hidden md:block">Order Created</span>
                                </div>

                                {/* Step 2: Processing */}
                                <div className="flex flex-col items-center text-center w-1/4">
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                                    currentStep >= 1 ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white border-gray-300 text-gray-400"
                                  }`}>
                                    {currentStep > 1 ? <FaCheckCircle className="text-xs" /> : <FaShieldAlt className="text-xs" />}
                                  </div>
                                  <span className="text-xs font-bold text-gray-800 mt-2 block">Processing</span>
                                  <span className="text-[10px] text-gray-400 hidden md:block">Payment Verified</span>
                                </div>

                                {/* Step 3: Shipped */}
                                <div className="flex flex-col items-center text-center w-1/4">
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                                    currentStep >= 2 ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white border-gray-300 text-gray-400"
                                  }`}>
                                    {currentStep > 2 ? <FaCheckCircle className="text-xs" /> : <FaTruck className="text-xs" />}
                                  </div>
                                  <span className="text-xs font-bold text-gray-800 mt-2 block">Shipped</span>
                                  <span className="text-[10px] text-gray-400 hidden md:block">In Transit</span>
                                </div>

                                {/* Step 4: Delivered */}
                                <div className="flex flex-col items-center text-center w-1/4">
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                                    currentStep >= 3 ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-white border-gray-300 text-gray-400"
                                  }`}>
                                    <FaHome className="text-xs" />
                                  </div>
                                  <span className="text-xs font-bold text-gray-800 mt-2 block">Delivered</span>
                                  <span className="text-[10px] text-gray-400 hidden md:block">At Your Door</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-gray-900 border-b pb-3">Security & Profile Details</h3>
                  
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">First Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                        <input
                          type="text"
                          value={profileForm.lastname}
                          onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Phone Contact</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Email Address (Read-Only)</label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="mt-2 block w-full rounded-md border-0 py-2 px-3 bg-gray-50 text-gray-400 shadow-sm ring-1 ring-gray-200 sm:text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Street Shipping Location</label>
                      <input
                        type="text"
                        value={profileForm.adress}
                        onChange={(e) => setProfileForm({ ...profileForm, adress: e.target.value })}
                        className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">City</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Country</label>
                        <input
                          type="text"
                          value={profileForm.country}
                          onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Postal / Zip Code</label>
                        <input
                          type="text"
                          value={profileForm.postalCode}
                          onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                          className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md transition-colors"
                      >
                        Save Profiles
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-gray-900 border-b pb-3">My Saved Wishlist Items</h3>
                <WishlistModule />
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BuyerDashboardPage;
