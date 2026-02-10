import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Keep this project isolated when nested in a larger workspace.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
