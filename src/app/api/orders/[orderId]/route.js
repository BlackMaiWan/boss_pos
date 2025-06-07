// app/api/orders/[orderId]/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../lib/mongodb';
import Order from '../../../../../models/Order';

// GET handler: ดึงข้อมูล Order เดี่ยวๆ
export async function GET(request, { params }) {
  const { orderId } = params;

  try {
    await connectMongoDB();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}