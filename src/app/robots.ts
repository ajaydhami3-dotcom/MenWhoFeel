import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",               // CMS — not public content
          "/assessment/results/", // Personal results — no index value
          "/command/",            // Personal dashboard
          "/debrief/",            // Personal AI conversation
        ],
      },
    ],
    sitemap: "https://www.menwhofeel.online/sitemap.xml",
    host: "https://www.menwhofeel.online",
  };
}
