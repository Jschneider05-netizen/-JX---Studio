import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{const base=process.env.PUBLIC_SITE_URL?.replace(/\/$/,"");return base === "https://jx-studio.de" ? {rules:[{userAgent:"*",allow:"/",disallow:["/admin","/portal","/builder","/templates","/beratung","/api/"]}],sitemap:`${base}/sitemap.xml`}:{rules:[{userAgent:"*",disallow:"/"}]};}
