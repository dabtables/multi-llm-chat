import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "pin_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.PIN_SESSION_SECRET || "fallback_pin_session_secret_for_local_dev_1234567890"
);

export function getExpectedPin(): string | null {
  return process.env.APP_PIN ? process.env.APP_PIN.trim() : null;
}

export function isPinRequired(): boolean {
  const pin = getExpectedPin();
  return Boolean(pin && pin.length > 0);
}

export async function createSessionToken(): Promise<string> {
  return await new SignJWT({ auth: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return Boolean(payload.auth);
  } catch {
    return false;
  }
}

export async function isAuthenticated(req?: NextRequest): Promise<boolean> {
  // If no PIN is configured in .env, authentication is not enforced
  if (!isPinRequired()) {
    return true;
  }

  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      return false;
    }
  }

  if (!token) return false;
  return await verifySessionToken(token);
}

export { COOKIE_NAME };
