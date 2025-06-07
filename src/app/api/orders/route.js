// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

// GET handler: ดึงรายการ Order ทั้งหมด
export async function GET(request) {
  try {
    await connectMongoDB();
    const orders = await Order.find({
      status: { $in: ['open', 'pending', 'preparing', 'served'] }
    }).sort({ openedAt: -1 });


    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}