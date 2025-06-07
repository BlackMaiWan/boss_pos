// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Order from '../../../../models/Order'; // นำเข้า Order Model

// GET handler: ดึงรายการ Order ทั้งหมด (หรือตามเงื่อนไขที่กำหนด)
export async function GET(request) {
  try {
    await connectMongoDB();

    // ดึง Order ทั้งหมด
    // คุณอาจจะเพิ่ม query parameters เพื่อ filter หรือ sort ได้ในอนาคต
    // เช่น: const { searchParams } = new URL(request.url);
    // const status = searchParams.get('status');
    // const query = status ? { status: status } : {};
    // const orders = await Order.find(query).sort({ openedAt: -1 }); // เรียงตามเวลาเปิดล่าสุด

    // ตัวอย่างการดึงเฉพาะ Order ที่สถานะเป็น 'open' หรือ 'pending'
    const orders = await Order.find({
      status: { $in: ['open', 'pending', 'preparing', 'served'] }
    }).sort({ openedAt: -1 });


    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}