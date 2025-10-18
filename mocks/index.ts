/**
 * Export and automatically start mock based on environment.
 * You can directly import this file in the app entry (main.tsx / layout.tsx).
 */
export async function enableMocking() {
  if (process.env.NODE_ENV !== "development") {
    console.log("[MSW] Mocking disabled in production");
    return;
  }

  const { worker } = await import("./browser");
  console.log("[MSW] Starting mock service worker...");

  await worker.start({
    onUnhandledRequest(request, print) {
      // Log unhandled requests for debugging
      if (request.url.includes("/subscription/")) {
        console.warn("[MSW] ⚠️ Unhandled subscription request:", request.url);
        console.warn("[MSW] Method:", request.method);
      }
      // Don't print warnings for other requests
    },
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });

  console.log("[MSW] ✅ Mocking enabled");
  console.log("[MSW] 🎯 Intercepting requests to: http://localhost:8000");
  console.log("[MSW] 📋 Registered handlers:");
  console.log("  - GET /subscription/api/v1/product-pricing/");
  console.log("  - POST /subscription/api/v1/checkout-session/");
  console.log("  - GET /subscription/api/v1/status/");
  console.log("  - POST /subscription/api/v1/cancel/");
}
