/// \u003creference types="vite/client" /\u003e

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
