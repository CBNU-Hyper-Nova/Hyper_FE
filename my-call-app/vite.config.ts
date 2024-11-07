// vite.config.js 또는 vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	define: {
		global: "window", // global을 window로 정의
	},
});
