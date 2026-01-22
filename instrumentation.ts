export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Only export onRequestError in Node.js runtime to avoid Edge compatibility issues
// The module-level Sentry import was causing MIDDLEWARE_INVOCATION_FAILED errors
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
  // Dynamic import to avoid loading Sentry at module initialization
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(error, request, context);
}
