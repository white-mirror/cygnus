import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cygnus.app",
  appName: "Cygnus",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    url: process.env.CAP_SERVER_URL ?? process.env.VITE_API_BASE_URL,
    cleartext: true,
  },
};

export default config;
