import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: resolve(import.meta.dirname, "../../"),
  transpilePackages: ["@groundwork/core", "@groundwork/ui"],
};

export default nextConfig;
