/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Where the API server lives, e.g. http://localhost:4000 */
    readonly VITE_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
