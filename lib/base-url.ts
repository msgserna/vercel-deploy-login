export function getBaseUrl() {
    // 1) Forzamos uso de variable pública si existe
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (fromEnv) return fromEnv;
  
    // 2) Fallback en cliente
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
  
    // 3) Fallback en server (preview en Vercel)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  
    // 4) Último recurso en dev
    return "http://localhost:3000";
  }
  