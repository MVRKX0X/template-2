import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_PUBLIC_* vars are automatically exposed to the browser by Next.js.
  // Never re-declare them in the env block — if they are undefined at build
  // time that would explicitly override them with undefined, breaking the
  // Supabase client everywhere.
};

export default nextConfig;
