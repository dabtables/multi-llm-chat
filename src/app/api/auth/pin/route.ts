import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getExpectedPin, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    const expectedPin = getExpectedPin();

    // If no PIN is configured, accept anything
    if (!expectedPin) {
      const token = await createSessionToken();
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    if (!pin || String(pin).trim() !== expectedPin) {
      return NextResponse.json(
        { success: false, error: "Incorrect PIN code. Please try again." },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
