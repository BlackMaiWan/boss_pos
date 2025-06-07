// app/api/menu-items/[id]/add-stock/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import MenuItem from '../../../../../../models/MenuItem';

export async function PUT(request, context) {
  const { id } = context.params;
  const { quantity } = await request.json();

  if (typeof quantity !== 'number' || quantity <= 0) {
    return NextResponse.json({ message: 'Quantity must be a positive number' }, { status: 400 });
  }

  try {
    await connectMongoDB();

    const updatedMenuItem = await MenuItem.findOneAndUpdate(
      { _id: id },
      {
        $inc: { stock: quantity },
      },
      { new: true }
    );

    if (!updatedMenuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    // ตรวจสอบและอัปเดต isAvailable ถ้าสต็อกมีค่า > 0 สถานะควรเป็นพร้อมขาย
    if (updatedMenuItem.stock > 0 && !updatedMenuItem.isAvailable) {
      updatedMenuItem.isAvailable = true;
      await updatedMenuItem.save();
    }

    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error) {
    console.error('Error adding stock to menu item:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}