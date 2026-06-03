import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/assessment/results/"],
      },
    ],
    sitemap: "https://www.menwhofeel.online/sitemap.xml",
    host: "https://www.menwhofeel.online",
  };
}
