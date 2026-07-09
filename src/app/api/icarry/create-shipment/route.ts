import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch Order Details from Supabase
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, customers(full_name, email, mobile)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Fetch Order Items
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("*, products(weight)")
      .eq("order_id", orderId);

    if (itemsErr || !items) {
      return NextResponse.json({ error: "Order items not found" }, { status: 404 });
    }

    // Determine weight (fallback to default if not configured)
    const defaultWeight = parseFloat(process.env.ICARRY_DEFAULT_WEIGHT || "0.25"); // kg
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const weight = defaultWeight * totalQty;

    const username = process.env.ICARRY_API_USERNAME || "ela43051";
    const apiKey = "ajlfCoeZcON3Kkk7yhQQdvSiCe33BUhRXmbWO47UuYzWG6D4iirG3Dnk4pgJgvk9o2Cg7m2NTh1kLytjrpyNWSUWaVGawPM2rUEpHNd07ctschv6NtQK2upToLk6J7Un6FfCl0zqd2xyUauvrDkR0cOGwKIYEsKKsLynVv0iAUTleKtCmhryyTqCDqPwbH2HbPB49zE1ECC8Fek3sk4Up44vuGum0G5fPNAoVIRTCmjQODgxsJkesHau7HHE7t";
    const pickupAddressId = process.env.ICARRY_PICKUP_ADDRESS_ID || "94313";

    if (!pickupAddressId) {
      return NextResponse.json({
        error: "iCarry Pickup Address ID is not configured. Please add ICARRY_PICKUP_ADDRESS_ID to your environment variables.",
      }, { status: 400 });
    }

    // Construct iCarry request body parameters
    const address = order.shipping_address || {};
    const payload = {
      api_token: apiKey,
      pickup_address_id: pickupAddressId,
      consignee_name: order.customers?.full_name || "Customer",
      consignee_phone: order.customers?.mobile || "9999999999",
      consignee_email: order.customers?.email || "",
      consignee_address: `${address.address1} ${address.address2 || ""}`.trim(),
      consignee_city: address.city || "",
      consignee_state: address.state || "",
      consignee_pincode: address.pinCode || "",
      weight: weight,
      length: parseInt(process.env.ICARRY_DEFAULT_LENGTH || "15"),
      width: parseInt(process.env.ICARRY_DEFAULT_WIDTH || "10"),
      height: parseInt(process.env.ICARRY_DEFAULT_HEIGHT || "8"),
      cod: order.payment_method === "cod" ? "1" : "0",
      cod_amount: order.payment_method === "cod" ? order.total_amount : "0",
      order_number: order.order_number,
      order_value: order.total_amount,
    };

    // Send shipment request to iCarry API (Surface/Hyperlocal endpoint) using '?' query separator
    const response = await fetch(`https://www.icarry.in/api_add_shipment_surface?api_token=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || result.status === "error") {
      return NextResponse.json({
        error: result.message || "Failed to book shipment on iCarry",
      }, { status: 500 });
    }

    // Save shipment_id and AWB in database
    const shipmentId = result.shipment_id;
    const awb = result.awb_number || "";

    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        icarry_shipment_id: shipmentId,
        awb_number: awb,
        order_status: "shipped",
        tracking_status: "in_transit",
      })
      .eq("id", orderId);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update order tracking details" }, { status: 500 });
    }

    return NextResponse.json({ success: true, shipmentId, awb });
  } catch (err: any) {
    console.error("iCarry shipment placement error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
