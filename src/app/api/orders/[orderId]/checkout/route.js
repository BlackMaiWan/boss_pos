// app/api/orders/[orderId]/checkout/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Order from '../../../../../../models/Order';
import Table from '../../../../../../models/Table'; // ต้องใช้ Table เพื่ออัปเดตสถานะโต๊ะ

export async function PUT(request, context) {
  const { orderId } = context.params;

  try {
    await connectMongoDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // ตรวจสอบสถานะ order ก่อน checkout
    if (order.status === 'paid' || order.status === 'canceled') {
        return NextResponse.json({ message: 'Order already processed' }, { status: 400 });
    }

    // อัปเดตสถานะ Order
    order.status = 'paid'; // หรือ 'completed'
    order.closedAt = new Date();
    // อาจเพิ่ม paymentMethod, transactionId จาก request body ได้
    await order.save();

    // อัปเดตสถานะโต๊ะให้เป็น 'available' และล้าง currentOrderId
    const tableNumber = order.tableNumber;
    await Table.updateOne(
      { tableNumber: tableNumber },
      { $set: { status: 'available' }, $unset: { currentOrderId: '' } } // $unset เพื่อลบ field
    );

    return NextResponse.json({ message: `Order ${orderId} checked out successfully!` }, { status: 200 });
  } catch (error) {
    console.error('Error during order checkout:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}