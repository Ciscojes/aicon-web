import type { Instrumentation } from "next";

export function register() {
  // Reserved for a future OpenTelemetry provider. Console output keeps
  // development and first deployments observable without a paid service.
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      event: "request_error",
      message,
      digest,
      method: request.method,
      path: request.path,
      route: context.routePath,
      routeType: context.routeType,
    }),
  );
};
