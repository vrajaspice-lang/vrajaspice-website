-- Run this SQL command in your Supabase SQL Editor to add the required tracking columns to the orders table.

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS icarry_shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS awb_number TEXT,
  ADD COLUMN IF NOT EXISTS tracking_status TEXT DEFAULT 'pending';
