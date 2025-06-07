// app/api/tables/[tableNumber]/status/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Table from '../../../../../../models/Table';

// PUT handler: อัปเดตสถานะของโต๊ะ
export async function PUT(request, { params }) {
  const { tableNumber } = params;
  const { status } = await request.json();

  // ตรวจสอบว่า status ที่ส่งมาถูกต้องตาม enum ที่กำหนดใน Table Model
  const validStatuses = ['available', 'in-use', 'cleaning', 'maintenance'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
  }

  try {
    await connectMongoDB();

    // ค้นหาและอัปเดตสถานะของโต๊ะ
    const updateData = { status: status };
    if (status === 'available') {
        updateData.$unset = { currentOrderId: "" }; //เคลียร์ฟิลด์ currebtOrderId
    } else {

    }


    const updatedTable = await Table.findOneAndUpdate(
      { tableNumber: parseInt(tableNumber) },
      updateData,
      { new: true }
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