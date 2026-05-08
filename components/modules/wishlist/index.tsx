"use client"
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import WishItem from "@/components/WishItem";
import apiClient from "@/lib/api";
import { nanoid } from "nanoid";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export const WishlistModule = () => {
  const [session, setSession] = useState<any>(null);
  const { wishlist, setWishlist } = useWishlistStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const getWishlistByUserId = async (id: string) => {
    const response = await apiClient.get(`/api/wishlist/${id}`, {
      cache: "no-store",
    });
    const wishlist = await response.json();

    const productArray: {
      id: string;
      title: string;
      price: number;
      image: string;
      slug: string
      stockAvailabillity: number;
    }[] = [];

    wishlist.map((item: any) => productArray.push({ id: item?.product?.id, title: item?.product?.title, price: item?.product?.price, image: item?.product?.mainImage, slug: item?.product?.slug, stockAvailabillity: item?.product?.inStock }));

    setWishlist(productArray);
  };

  const getUserByEmail = async () => {
    if (session?.user?.email) {
      apiClient.get(`/api/users/email/${session?.user?.email}`, {
        cache: "no-store",
      })
        .then((response) => response.json())
        .then((data) => {
          getWishlistByUserId(data?.id);
        });
    }
  };

  useEffect(() => {
    getUserByEmail();
  }, [session?.user?.email, wishlist.length]);
  return (
    <>

      {wishlist && wishlist.length === 0 ? (
        <h3 className="text-center text-4xl py-10 text-black max-lg:text-3xl max-sm:text-2xl max-sm:pt-5 max-[400px]:text-xl">
          No items found in the wishlist
        </h3>
      ) : (
        <div className="max-w-screen-2xl mx-auto">
          <div className="overflow-x-auto">
            <table className="table text-center">
              <thead>
                <tr>
                  <th></th>
                  <th className="text-accent-content">Image</th>
                  <th className="text-accent-content">Name</th>
                  <th className="text-accent-content">Stock Status</th>
                  <th className="text-accent-content">Action</th>
                </tr>
              </thead>
              <tbody>
                {wishlist &&
                  wishlist?.map((item) => (
                    <WishItem
                      id={item?.id}
                      title={item?.title}
                      price={item?.price}
                      image={item?.image}
                      slug={item?.slug}
                      stockAvailabillity={item?.stockAvailabillity}
                      key={nanoid()}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
