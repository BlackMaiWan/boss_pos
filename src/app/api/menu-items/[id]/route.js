// app/api/menu-items/[id]/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../lib/mongodb';
import MenuItem from '../../../../../models/MenuItem';

// GET handler: ดึงรายการอาหารด้วย ID
export async function GET(request, { params }) {
  const { id } = params;
  try {
    await connectMongoDB();
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(menuItem, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu item by ID:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// PUT handler: แก้ไขรายการอาหารด้วย ID
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    await connectMongoDB();
    const body = await request.json();

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, body, { new: true }); // { new: true } คืนค่า Document ที่อัปเดตแล้ว

    if (!updatedMenuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Menu item with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// DELETE handler: ลบรายการอาหารด้วย ID
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await connectMongoDB();
    const deletedMenuItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedMenuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}