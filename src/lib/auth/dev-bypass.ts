/** Local dev only — never enabled in production builds. */
export function isDevBypassAuth(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_BYPASS_AUTH === "true"
  );
}

export function getDevUserId(): string | null {
  return process.env.DEV_USER_ID ?? null;
}
