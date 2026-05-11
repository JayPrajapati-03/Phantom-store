import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const permissionsPolicy = [
  'accelerometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.razorpay.com")',
  'gyroscope=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.razorpay.com")',
  'magnetometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.razorpay.com")'
].join(", ");

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cache-Control": "no-store",
      "Permissions-Policy": permissionsPolicy
    }
  },
  preview: {
    headers: {
      "Cache-Control": "no-store",
      "Permissions-Policy": permissionsPolicy
    }
  }
});
