import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_SEC = 24 * 3600;

export const UPLOAD_ALLOWED_SLUGS = ["patrick-schaefer", "luca-hoffmann"] as const;
export type UploadAllowedSlug = (typeof UPLOAD_ALLOWED_SLUGS)[number];

function getSecret(): string | null {
  return process.env.PORTAL_UPLOAD_SECRET ?? null;
}

export function isUploadEnabled(): boolean {
  return getSecret() !== null;
}

export function signUploadToken(slug: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const ts = Math.floor(Date.now() / 1000);
  const payload = `${slug}:${ts}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyUploadToken(token: string): UploadAllowedSlug | null {
  const secret = getSecret();
  if (!secret) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const colonIndex = decoded.lastIndexOf(":");
    if (colonIndex < 0) return null;
    const payload = decoded.slice(0, colonIndex);
    const sig = decoded.slice(colonIndex + 1);

    const parts = payload.split(":");
    if (parts.length !== 2) return null;
    const [slug, tsStr] = parts;
    const ts = Number(tsStr);
    if (!Number.isFinite(ts) || Date.now() / 1000 - ts > TOKEN_TTL_SEC) return null;

    const expectedSig = createHmac("sha256", secret).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

    if (!UPLOAD_ALLOWED_SLUGS.includes(slug as UploadAllowedSlug)) return null;
    return slug as UploadAllowedSlug;
  } catch {
    return null;
  }
}
