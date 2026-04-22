import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PRELAUNCH_MODE: process.env.NEXT_PUBLIC_PRELAUNCH_MODE ?? "",
    NEXT_PUBLIC_EVENT_DATE: process.env.NEXT_PUBLIC_EVENT_DATE ?? "",
  },
};

export default withNextIntl(nextConfig);
