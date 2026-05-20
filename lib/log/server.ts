import "server-only";

type LogContext = Record<string, string | number | boolean | null | undefined>;

function firebaseEnvConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim(),
  );
}

function formatError(err: unknown): Record<string, string | undefined> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack?.split("\n").slice(0, 10).join("\n"),
    };
  }
  return { message: String(err) };
}

function runtimeHints(): LogContext {
  return {
    node: process.version,
    nextRuntime: process.env.NEXT_RUNTIME ?? null,
    cfPages: process.env.CF_PAGES === "1",
    cfWorker: Boolean(process.env.CF_WORKERS_URL || process.env.CLOUDFLARE_WORKERS),
    vercel: Boolean(process.env.VERCEL),
    firebaseConfigured: firebaseEnvConfigured(),
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
  };
}

function emit(level: "info" | "warn" | "error", scope: string, event: string, ctx?: LogContext, err?: unknown) {
  const line = JSON.stringify({
    level,
    ts: new Date().toISOString(),
    scope,
    event,
    ...runtimeHints(),
    ...ctx,
    ...(err !== undefined ? { error: formatError(err) } : {}),
  });
  if (level === "error") console.error(`[bodrum] ${line}`);
  else if (level === "warn") console.warn(`[bodrum] ${line}`);
  else console.log(`[bodrum] ${line}`);
}

export function logInfo(scope: string, event: string, ctx?: LogContext) {
  emit("info", scope, event, ctx);
}

export function logWarn(scope: string, event: string, ctx?: LogContext, err?: unknown) {
  emit("warn", scope, event, ctx, err);
}

export function logError(scope: string, event: string, ctx?: LogContext, err?: unknown) {
  emit("error", scope, event, ctx, err);
}
