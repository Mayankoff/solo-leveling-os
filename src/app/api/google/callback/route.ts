import { google } from "googleapis";
import { NextResponse } from "next/server";
import db from "@/lib/db";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/google/callback`
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state"); // We passed userId in the state param

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/agenda?error=missing_params", request.url));
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      // If we don't get a refresh token, it means the user has already granted access before.
      // For a robust app, we would force prompt="consent" in the auth URL (which we did).
      console.warn("No refresh token received. May need to disconnect and reconnect.");
    }

    await db.googleIntegration.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || "", // Should be there due to prompt="consent"
        expiryDate: tokens.expiry_date || Date.now() + 3600000,
      },
      update: {
        accessToken: tokens.access_token!,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiryDate: tokens.expiry_date || Date.now() + 3600000,
      }
    });

    return NextResponse.redirect(new URL("/agenda?success=connected", request.url));
  } catch (error) {
    console.error("Google OAuth Error:", error);
    return NextResponse.redirect(new URL("/agenda?error=oauth_failed", request.url));
  }
}
