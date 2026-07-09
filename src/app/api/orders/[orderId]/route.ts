import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    // 1. Fetch order details with joined customer details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, customers(full_name, email, mobile)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order details:', orderError)
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // 2. Fetch order items with joined product specifications (weight, image, mrp)
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(weight, image_url, mrp)')
      .eq('order_id', orderId)

    if (itemsError || !items) {
      console.error('Error fetching order items:', itemsError)
      return NextResponse.json({ success: false, error: 'Order items not found' }, { status: 404 })
    }

    // 3. Format into the OrderData structure expected by the confirmation page
    const formattedOrder = {
      orderId: order.id.toString(),
      orderNumber: order.order_number,
      customerName: order.customers?.full_name || '',
      mobile: order.customers?.mobile || '',
      email: order.customers?.email || '',
      shippingAddress: order.shipping_address, // JSONB structure
      items: items.map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        weight: item.products?.weight || '100g',
        quantity: item.quantity,
        sellingPrice: Number(item.unit_price),
        mrp: Number(item.products?.mrp || item.unit_price),
        imageUrl: item.products?.image_url || '/logo.png',
      })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping_charge),
      total: Number(order.total_amount),
      paymentMethod: order.payment_method,
      placedAt: order.created_at,
      awbNumber: order.awb_number || null,
      icarryShipmentId: order.icarry_shipment_id || null,
    }

    return NextResponse.json(formattedOrder)
  } catch (err: any) {
    console.error('Error retrieving order confirmation details:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}
