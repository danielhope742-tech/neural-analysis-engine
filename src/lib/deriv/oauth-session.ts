
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function randomToken(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return toBase64Url(bytes);
}

export async function createPkcePair() {
  const verifier = randomToken(48);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(verifier),
  );

  return {
    verifier,
    challenge: toBase64Url(new Uint8Array(digest)),
  };
}

async function encryptionKey(secret: string): Promise<CryptoKey> {
  if (secret.length < 32) {
    throw new Error("Session secret must be at least 32 characters.");
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(secret),
  );

  return crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSession(
  data: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const key = await encryptionKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(data)),
  );

  return `${toBase64Url(iv)}.${toBase64Url(
    new Uint8Array(encrypted),
  )}`;
}

export async function decryptSession<T>(
  value: string,
  secret: string,
): Promise<T | null> {
  try {
    const [ivPart, encryptedPart] = value.split(".");

    if (!ivPart || !encryptedPart) return null;

    const key = await encryptionKey(secret);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fromBase64Url(ivPart),
      },
      key,
      fromBase64Url(encryptedPart),
    );

    return JSON.parse(decoder.decode(decrypted)) as T;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!header) return cookies;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");

    if (separator === -1) continue;

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  }

  return cookies;
}

export function sessionCookie(value: string, maxAge = 3600): string {
  return [
    `deriv_session=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function clearSessionCookie(): string {
  return [
    "deriv_session=",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}
