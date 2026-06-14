import type { NextConfig } from "next";

const basePath = (process.env.BASE_PATH || "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  basePath,
  output: "standalone",
  serverExternalPackages: ["@google-cloud/storage", "google-auth-library"],
};

export default nextConfig;
