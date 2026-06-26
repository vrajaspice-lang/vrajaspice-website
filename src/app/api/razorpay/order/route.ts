import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Razorpay from 'razorpay'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    // 1. Fetch order details from Supabase (to avoid client-side amount tampering)
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('total_amount, order_number')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      console.error('Error fetching order for Razorpay:', fetchError)
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // 2. Initialize Razorpay SDK
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error('Razorpay keys are not configured in environment variables.')
      return NextResponse.json({ success: false, error: 'Payment gateway configuration error' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // 3. Create order on Razorpay
    // Razorpay amount is in paise (e.g. ₹100 = 10000 paise)
    const amountInPaise = Math.round(Number(order.total_amount) * 100)

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.order_number,
    })

    if (!rzpOrder || !rzpOrder.id) {
      throw new Error('Failed to create order on Razorpay API')
    }

    // 4. Save the Razorpay Order ID to the order record in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order with Razorpay Order ID:', updateError.message)
      // We don't block because payment can still go through, but log it
    }

    return NextResponse.json({
      success: true,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      order_number: order.order_number,
    })
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}
