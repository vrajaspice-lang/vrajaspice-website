import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { shipmentId } = await req.json();

    if (!shipmentId) {
      return NextResponse.json({ error: "Shipment ID is required" }, { status: 400 });
    }

    const apiKey = "ajlfCoeZcON3Kkk7yhQQdvSiCe33BUhRXmbWO47UuYzWG6D4iirG3Dnk4pgJgvk9o2Cg7m2NTh1kLytjrpyNWSUWaVGawPM2rUEpHNd07ctschv6NtQK2upToLk6J7Un6FfCl0zqd2xyUauvrDkR0cOGwKIYEsKKsLynVv0iAUTleKtCmhryyTqCDqPwbH2HbPB49zE1ECC8Fek3sk4Up44vuGum0G5fPNAoVIRTCmjQODgxsJkesHau7HHE7t";

    const response = await fetch(`https://www.icarry.in/api_track_shipment&api_token=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipment_id: shipmentId }),
    });

    const data = await response.json();

    if (!response.ok || data.status === "error") {
      return NextResponse.json({ error: data.message || "Failed to fetch tracking data" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      awb: data.awb_number || "",
      carrier: data.carrier || "iCarry Partner",
      status: data.shipment_status || "In Transit",
      statusId: data.status_id || 3, // e.g. 21 is delivered
      events: data.tracking_history || [],
    });
  } catch (err: any) {
    console.error("Tracking API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
