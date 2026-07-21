import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses service role to update phone_verified flag
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

function formatPhoneNumber(num: string): string {
  const clean = num.replace(/\D/g, "");
  if (clean.length === 10) return "+91" + clean;
  if (!num.startsWith("+") && clean.startsWith("91")) return "+" + clean;
  return num.startsWith("+") ? num : "+" + num;
}

export async function POST(request: Request) {
  try {
    const { otp, maskId, phone, userId } = await request.json();

    if (!otp || !maskId || !phone || !userId) {
      return NextResponse.json(
        { error: "otp, maskId, phone and userId are required." },
        { status: 400 }
      );
    }

    const clientId =
      process.env.AUTHYO_CLIENT_ID || "4310bea735f641f988873c8c61163823";
    const clientSecret =
      process.env.AUTHYO_CLIENT_SECRET || "495b3bebaf154dae849b4b1a076443f9";

    // 1. Verify OTP with Authyo
    const url = new URL("https://app.authyo.io/api/v1/auth/verifyotp");
    url.searchParams.append("maskId", maskId);
    url.searchParams.append("otp", otp);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        clientId,
        clientSecret,
        origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
    });

    const data = await response.json();

    if (!response.ok || data.success !== true) {
      return NextResponse.json(
        { error: data.message || "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // 2. Mark phone as verified in customers table
    const formattedPhone = formatPhoneNumber(phone);
    const { error: updateError } = await supabaseAdmin
      .from("customers")
      .update({
        mobile: formattedPhone,
        phone_verified: true,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update phone_verified:", updateError.message);
      return NextResponse.json(
        { error: "OTP verified but failed to save. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error("Error in verify-phone API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
