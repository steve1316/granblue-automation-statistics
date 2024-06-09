import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dotenv from "dotenv"

// Run dotenv config.
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // define process env
    define: {
        "process.env": process.env,
        // "process.env.NODE_ENV": JSON.stringify(process.env.TEST)
    },
    build: {
        outDir: "build",
    },
    // preview: {
    //     port: 5173,
    //     strictPort: true,
    // },
    server: {
        port: 5173,
        strictPort: true,
        host: true,
        // origin: "http://localhost:8666",
    }
})