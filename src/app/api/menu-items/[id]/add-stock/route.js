// app/api/menu-items/[id]/add-stock/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import MenuItem from '../../../../../../models/MenuItem';

// PUT handler สำหรับเพิ่มสต็อก
export async function PUT(request, context) { // ใช้ context แทน params
  const { id } = context.params; // ดึง id ของ MenuItem จาก URL
  const { quantity } = await request.json(); // ดึงจำนวนที่จะเพิ่มจาก body

  // ตรวจสอบว่า quantity เป็นบวก
  if (typeof quantity !== 'number' || quantity <= 0) {
    return NextResponse.json({ message: 'Quantity must be a positive number' }, { status: 400 });
  }

  try {
    await connectMongoDB();

    const updatedMenuItem = await MenuItem.findOneAndUpdate(
      { _id: id },
      {
        $inc: { stock: quantity }, // เพิ่มสต็อกตาม quantity
      },
      { new: true } // คืนค่า Document ที่อัปเดตแล้ว
    );

    if (!updatedMenuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    // หลังจากที่สต็อกถูกเพิ่มแล้ว ให้ตรวจสอบและอัปเดต isAvailable
    // ถ้าสต็อกมีค่า > 0 สถานะควรเป็นพร้อมขาย
    if (updatedMenuItem.stock > 0 && !updatedMenuItem.isAvailable) {
      updatedMenuItem.isAvailable = true;
      await updatedMenuItem.save(); // บันทึกการเปลี่ยนแปลง isAvailable
    }

    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error) {
    console.error('Error adding stock to menu item:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}