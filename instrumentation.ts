export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  // Edge runtime Sentry disabled - causing MIDDLEWARE_INVOCATION_FAILED on Vercel
  // The @sentry/nextjs package has Node.js dependencies incompatible with Edge Runtime
  // if (process.env.NEXT_RUNTIME === "edge") {
  //   await import("./sentry.edge.config");
  // }
}

// Only capture errors in Node.js runtime - Edge runtime has Sentry disabled
// due to MIDDLEWARE_INVOCATION_FAILED errors from incompatible Node.js dependencies
export async function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
    renderSource?: "react-server-components" | "react-server-components-payload" | "server-rendering";
    revalidateReason?: "on-demand" | "stale" | undefined;
    renderType?: "dynamic" | "dynamic-resume";
  }
): Promise<void> {
  // Skip Sentry in Edge runtime to avoid compatibility issues
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }
  // Dynamic import to avoid loading Sentry at module initialization
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(error, request, context);
}
