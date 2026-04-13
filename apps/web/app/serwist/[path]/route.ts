import { createSerwistRoute } from "@serwist/turbopack";

// Build-time revision for precache busting. Prefer CI env vars over spawning git.
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute(
  {
    additionalPrecacheEntries: [{ url: "/", revision }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  },
);
