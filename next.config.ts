import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local-only demo database — needs native fs/WASM loading, must not be
  // bundled by Turbopack. Harmless to keep even once a real DATABASE_URL
  // (Neon) is configured, since it's then never imported at runtime.
  serverExternalPackages: ["@electric-sql/pglite", "pglite-prisma-adapter"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Only used for seeded demo content's placeholder cover images.
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
