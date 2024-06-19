import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //use dotenv in Vite
  base: "/", // Ensure this is set to '/' for root domain hosting
});
