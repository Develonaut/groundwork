import type { NextConfig } from "next";
import { resolve } from "node:path";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: resolve(import.meta.dirname, "../../"),
  transpilePackages: ["@groundwork/core", "@groundwork/ui"],
};

export default withSerwist(nextConfig);
