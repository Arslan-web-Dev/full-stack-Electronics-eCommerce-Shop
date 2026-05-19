"use client";

import React from "react";
import Link from "next/link";
import { 
  FaPlus, 
  FaBox, 
  FaUsers, 
  FaShoppingCart, 
  FaTags, 
  FaChartBar,
  FaCog,
  FaArrowRight
} from "react-icons/fa";
import { DashboardSidebar } from "@/components";

const ControlPanel = () => {
  const quickActions = [
    {
      title: "Add New Product",
      description: "Create and add a new product to the inventory",
      icon: <FaPlus className="text-2xl" />,
      link: "/admin/products/new",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Manage Products",
      description: "View, edit, or delete existing products",
      icon: <FaBox className="text-2xl" />,
      link: "/admin/products",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Manage Categories",
      description: "Add or edit product categories",
      icon: <FaTags className="text-2xl" />,
      link: "/admin/categories",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: <FaUsers className="text-2xl" />,
      link: "/admin/users",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "View Orders",
      description: "Manage and track customer orders",
      icon: <FaShoppingCart className="text-2xl" />,
      link: "/admin/orders",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "Analytics Dashboard",
      description: "View sales analytics and reports",
      icon: <FaChartBar className="text-2xl" />,
      link: "/admin",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      
      <div className="flex-1 p-8 max-md:p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Control Panel</h1>
          <p className="text-gray-600">Quick access to all admin management tools</p>
        </div>

        {/* Add Product - Featured Section */}
        <div className="mb-8">
          <Link 
            href="/admin/products/new"
            className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaPlus className="text-3xl text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-1">Add New Product</h2>
                  <p className="text-blue-100 text-sm">Quickly add a new product to your inventory</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaArrowRight className="text-xl text-white" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <div className={`bg-gradient-to-r ${action.color} bg-clip-text text-transparent`}>
                    {action.icon}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Tools Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/merchant"
              className="flex items-center gap-x-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaCog className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Merchant Management</h3>
                <p className="text-sm text-gray-500">Manage merchant accounts</p>
              </div>
            </Link>
            <Link
              href="/admin/bulk-upload"
              className="flex items-center gap-x-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaBox className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Bulk Upload</h3>
                <p className="text-sm text-gray-500">Upload products in bulk</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
