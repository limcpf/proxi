const defaultCorsOrigin = "http://localhost:5173";

export function parseCorsOrigins(input = process.env.PROXI_CORS_ORIGINS) {
  const origins = (input ?? defaultCorsOrigin)
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.includes("*")) {
    return true;
  }

  return origins.length > 0 ? origins : [defaultCorsOrigin];
}
