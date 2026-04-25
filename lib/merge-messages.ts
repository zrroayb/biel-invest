export function deepMerge(
  base: Record<string, unknown>,
  override: unknown,
): Record<string, unknown> {
  if (
    override == null ||
    typeof override !== "object" ||
    Array.isArray(override)
  ) {
    return structuredClone(base);
  }
  const b = structuredClone(base) as Record<string, unknown>;
  const o = override as Record<string, unknown>;
  for (const key of Object.keys(o)) {
    const bVal = b[key] as unknown;
    const oVal = o[key];
    if (oVal === undefined) continue;
    if (
      bVal &&
      typeof bVal === "object" &&
      !Array.isArray(bVal) &&
      oVal &&
      typeof oVal === "object" &&
      !Array.isArray(oVal)
    ) {
      b[key] = deepMerge(bVal as Record<string, unknown>, oVal);
    } else {
      b[key] = oVal;
    }
  }
  return b;
}

export function setStringAtPath(
  target: Record<string, unknown>,
  path: string,
  value: string,
): Record<string, unknown> {
  const out = structuredClone(target);
  const parts = path.split(".");
  let cur: Record<string, unknown> = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!;
    const n = cur[p];
    if (n == null || typeof n !== "object" || Array.isArray(n)) {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1]!;
  cur[leaf] = value;
  return out;
}
