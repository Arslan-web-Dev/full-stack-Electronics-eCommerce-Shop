"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { SectionTitle } from "@/components";
import { useProductStore } from "../_zustand/store";
import { useAuthStore } from "../_zustand/authStore";
import apiClient from "@/lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51PTestKey1234567890Publishable"
);

const CheckoutFormInner = () => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  
  const { products, total, clearCart } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment Method, 3: Review & Pay
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    company: "",
    adress: "",
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    orderNotice: "",
  });

  // Pre-fill user email if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setCheckoutForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [isAuthenticated, user?.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    const required = ["name", "lastname", "phone", "email", "adress", "city", "country", "postalCode"];
    for (const field of required) {
      if (!checkoutForm[field as keyof typeof checkoutForm]?.trim()) {
        toast.error(`Please fill in the required field: ${field}`);
        return false;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(checkoutForm.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleCouponApply = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "ARSLAN20" || code === "WELCOME20") {
      setDiscountPercent(20);
      setAppliedCoupon(code);
      toast.success("Promo code applied: 20% discount!");
    } else if (code === "DISCOUNT10") {
      setDiscountPercent(10);
      setAppliedCoupon(code);
      toast.success("Promo code applied: 10% discount!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const discountedTotal = total - (total * discountPercent) / 100;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (products.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("📦 Creating customer order...");

      // 1. Save Customer_order in Database
      const orderData = {
        name: checkoutForm.name.trim(),
        lastname: checkoutForm.lastname.trim(),
        phone: checkoutForm.phone.trim(),
        email: checkoutForm.email.trim().toLowerCase(),
        company: checkoutForm.company.trim() || "N/A",
        adress: checkoutForm.adress.trim(),
        apartment: checkoutForm.apartment.trim() || "N/A",
        postalCode: checkoutForm.postalCode.trim(),
        status: "pending",
        total: Math.round(discountedTotal),
        city: checkoutForm.city.trim(),
        country: checkoutForm.country.trim(),
        orderNotice: checkoutForm.orderNotice.trim() || "None",
        userId: user?.id || null,
      };

      const orderResponse = await apiClient.post("/api/orders", orderData);
      if (!orderResponse.ok) {
        throw new Error("Order creation failed on server");
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.id;

      // 2. Add products to customer_order_product relation table
      for (const item of products) {
        await apiClient.post("/api/order-product", {
          orderId,
          productId: item.id,
          quantity: item.amount,
        });
      }

      // 3. Handle Payment Flow
      if (paymentMethod === "cod") {
        // Record COD Payment
        const recordResponse = await apiClient.post("/api/payments/record", {
          orderId,
          amount: Math.round(discountedTotal),
          method: "cod",
          status: "pending",
        });

        if (recordResponse.ok) {
          toast.success("Order placed successfully via Cash on Delivery!");
          clearCart();
          router.push(`/buyer-dashboard`);
        } else {
          toast.error("Failed to record local payment log.");
        }
      } else {
        // Stripe Online Payment Flow
        if (!stripe || !elements) {
          toast.error("Stripe is not fully loaded. Please retry.");
          setIsSubmitting(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          toast.error("Card Element not loaded.");
          setIsSubmitting(false);
          return;
        }

        // Create Payment Intent
        const intentResponse = await apiClient.post("/api/payments/create-intent", {
          orderId,
          amount: Math.round(discountedTotal),
        });

        if (!intentResponse.ok) {
          const errData = await intentResponse.json();
          throw new Error(errData.error || "Failed to create Stripe payment intent");
        }

        const { clientSecret, stripePaymentId } = await intentResponse.json();

        // Confirm Card Payment
        const stripeResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${checkoutForm.name} ${checkoutForm.lastname}`,
              email: checkoutForm.email,
              phone: checkoutForm.phone,
            },
          },
        });

        if (stripeResult.error) {
          // Record payment failure
          await apiClient.post("/api/payments/record", {
            orderId,
            stripePaymentId,
            amount: Math.round(discountedTotal),
            method: "stripe",
            status: "failed",
          });
          throw new Error(stripeResult.error.message || "Stripe card validation failed");
        }

        if (stripeResult.paymentIntent?.status === "succeeded") {
          // Record payment completion
          await apiClient.post("/api/payments/record", {
            orderId,
            stripePaymentId,
            amount: Math.round(discountedTotal),
            method: "stripe",
            status: "completed",
          });

          toast.success("Secure credit card payment successful!");
          clearCart();
          router.push(`/buyer-dashboard`);
        }
      }
    } catch (error: any) {
      console.error("Checkout submission failed:", error);
      toast.error(error.message || "An unexpected error occurred during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Steps Header */}
      <div className="flex justify-center items-center space-x-4 mb-10 max-sm:space-x-2">
        <button
          onClick={() => step > 1 && setStep(1)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all ${
            step === 1 ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
          <span>Shipping</span>
        </button>
        <div className="w-12 h-0.5 bg-gray-200" />
        <button
          onClick={() => step > 2 && setStep(2)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all ${
            step === 2 ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          disabled={step < 2}
        >
          <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
          <span>Payment Method</span>
        </button>
        <div className="w-12 h-0.5 bg-gray-200" />
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all ${
            step === 3 ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100 text-gray-600"
          }`}
          disabled={step < 3}
        >
          <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
          <span>Review & Pay</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Panel */}
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={checkoutForm.name}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastname"
                    value={checkoutForm.lastname}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={checkoutForm.phone}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={checkoutForm.email}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Street Address *</label>
                <input
                  type="text"
                  name="adress"
                  placeholder="House number and street name"
                  value={checkoutForm.adress}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Apartment / Suite</label>
                  <input
                    type="text"
                    name="apartment"
                    value={checkoutForm.apartment}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={checkoutForm.company}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Postal / Zip Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={checkoutForm.postalCode}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Town / City *</label>
                  <input
                    type="text"
                    name="city"
                    value={checkoutForm.city}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={checkoutForm.country}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Order Notes (Optional)</label>
                <textarea
                  name="orderNotice"
                  rows={4}
                  placeholder="Special instructions for delivery."
                  value={checkoutForm.orderNotice}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => validateShipping() && setStep(2)}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`p-6 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all ${
                    paymentMethod === "stripe"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-lg font-bold text-gray-900">Secure Online Card</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "stripe" ? "border-indigo-600" : "border-gray-300"
                    }`}>
                      {paymentMethod === "stripe" && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Pay instantly using credit/debit card. Fully encrypted and protected by Stripe.</p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-0.5 bg-white text-xs font-bold text-indigo-600 rounded border">VISA</span>
                    <span className="px-2 py-0.5 bg-white text-xs font-bold text-indigo-600 rounded border">MASTERCARD</span>
                    <span className="px-2 py-0.5 bg-white text-xs font-bold text-indigo-600 rounded border">AMEX</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-6 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all ${
                    paymentMethod === "cod"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-lg font-bold text-gray-900">Cash on Delivery</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "cod" ? "border-indigo-600" : "border-gray-300"
                    }`}>
                      {paymentMethod === "cod" && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Pay with cash when the courier driver delivers the package to your doorstep.</p>
                  <span className="px-2 py-0.5 bg-white text-xs font-bold text-emerald-600 rounded border border-emerald-200 self-start">ZERO FEES</span>
                </button>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Back to Address
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md transition-colors"
                >
                  Review Order Details
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Finalize Purchase</h3>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <h4 className="font-bold text-gray-900">Delivery Address Summary</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {checkoutForm.name} {checkoutForm.lastname} <br />
                  {checkoutForm.company && `${checkoutForm.company}, `} {checkoutForm.adress} {checkoutForm.apartment && `, ${checkoutForm.apartment}`} <br />
                  {checkoutForm.city}, {checkoutForm.country} - {checkoutForm.postalCode} <br />
                  Phone: {checkoutForm.phone}
                </p>
              </div>

              {paymentMethod === "stripe" ? (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Enter Credit/Debit Card Details</h4>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 shadow-inner">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#1f2937",
                            fontFamily: "Outfit, Inter, sans-serif",
                            "::placeholder": {
                              color: "#9ca3af",
                            },
                          },
                          invalid: {
                            color: "#dc2626",
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Your connection is fully secure and encrypted. We do not store your credit card digits.</p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <h4 className="font-bold mb-2">Cash on Delivery details</h4>
                  <p className="text-sm">You selected Cash on Delivery. You will pay <strong>${Math.round(discountedTotal)}</strong> directly to our delivery courier in cash upon receiving your electronic items at your home address.</p>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Back to Payment
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></div>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Pay & Complete Purchase (${Math.round(discountedTotal)})</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Order Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Order Summary</h3>
            <div className="divide-y max-h-60 overflow-y-auto pr-1">
              {products.map((item) => (
                <div key={item.id} className="flex py-3 space-x-4">
                  <div className="relative w-12 h-12 rounded-lg border overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.amount}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-950">${item.price * item.amount}</span>
                </div>
              ))}
            </div>

            {/* Coupons Form */}
            <div className="pt-4 border-t space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Have a promo code?</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleCouponApply}
                  className="px-4 py-1.5 bg-gray-950 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </div>
              <p className="text-xs text-gray-400">Try <strong>ARSLAN20</strong> for an instant 20% discount!</p>
            </div>

            {/* Costs Breakdown */}
            <div className="pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${(total * discountPercent) / 100}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-950 pt-2 border-t">
                <span>Total Amount</span>
                <span>${Math.round(discountedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SectionTitle title="Checkout" path="Home | Checkout" />
      <Elements stripe={stripePromise}>
        <CheckoutFormInner />
      </Elements>
    </div>
  );
};

export default CheckoutPage;
