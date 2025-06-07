// app/api/orders/[orderId]/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../lib/mongodb';
import Order from '../../../../../models/Order'; // นำเข้า Order Model

// GET handler: ดึงข้อมูล Order เดี่ยวๆ
export async function GET(request, { params }) {
  const { orderId } = params; // _id ของ Order

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

// (Optional) PUT handler สำหรับอัปเดตข้อมูลพื้นฐานของ Order (เช่น หมายเหตุรวม)
// export async function PUT(request, { params }) {
//   const { orderId } = params;
//   try {
//     await connectMongoDB();
//     const body = await request.json();
//     const updatedOrder = await Order.findByIdAndUpdate(orderId, body, { new: true });
//     if (!updatedOrder) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
//     return NextResponse.json(updatedOrder, { status: 200 });
//   } catch (error) {
//     console.error('Error updating order:', error);
//     return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
//   }
// }