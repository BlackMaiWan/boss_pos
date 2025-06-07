// app/api/tables/[tableNumber]/status/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Table from '../../../../../../models/Table';

// PUT handler: อัปเดตสถานะของโต๊ะ
export async function PUT(request, { params }) {
  const { tableNumber } = params; // ดึง tableNumber จาก URL
  const { status } = await request.json(); // ดึงสถานะใหม่จาก body

  // ตรวจสอบว่า status ที่ส่งมาถูกต้องตาม enum ที่กำหนดใน Table Model
  const validStatuses = ['available', 'in-use', 'cleaning', 'maintenance']; // เพิ่มสถานะอื่นๆ ถ้ามี
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
  }

  try {
    await connectMongoDB();

    // ค้นหาและอัปเดตสถานะของโต๊ะ
    // ถ้าสถานะเป็น 'available' ก็ควรล้าง currentOrderId ด้วย
    const updateData = { status: status };
    if (status === 'available') {
        updateData.$unset = { currentOrderId: "" }; // ลบ field currentOrderId ออกไป
    } else {
        // หากต้องการตั้งค่า currentOrderId เมื่อเป็น in-use จาก API นี้ ให้ใส่เพิ่ม
        // แต่ใน flow ปัจจุบัน currentOrderId ถูกตั้งเมื่อ 'open' table
        // updateData.$set = { currentOrderId: someOrderId };
    }


    const updatedTable = await Table.findOneAndUpdate(
      { tableNumber: parseInt(tableNumber) },
      updateData,
      { new: true } // คืนค่า Document ที่อัปเดตแล้ว
    );

    if (!updatedTable) {
      return NextResponse.json({ message: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTable, { status: 200 });
  } catch (error) {
    console.error(`Error updating table ${tableNumber} status:`, error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}