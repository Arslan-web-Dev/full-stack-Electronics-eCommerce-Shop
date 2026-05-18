import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/buyer-dashboard",
          "/buyer-dashboard/*",
          "/checkout",
          "/cart",
          "/api/*",
          "/_next/*",
          "/*?*", // Disallow query parameters to prevent duplicate content crawl issues (faceted navigation)
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/buyer-dashboard",
          "/buyer-dashboard/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
