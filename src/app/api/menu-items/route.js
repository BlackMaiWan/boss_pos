// app/api/menu-items/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import MenuItem from '../../../../models/MenuItem';

// GET handler: ดึงรายการอาหารทั้งหมด
export async function GET(request) {
  try {
    await connectMongoDB();
    const menuItems = await MenuItem.find({}); // ดึงข้อมูลทั้งหมดจาก Collection

    return NextResponse.json(menuItems, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST handler: เพิ่มรายการอาหารใหม่
export async function POST(request) {
  try {
    await connectMongoDB();
    const body = await request.json();

    // สร้าง MenuItem ใหม่จากข้อมูลที่ได้รับ
    const newMenuItem = new MenuItem(body);
    const savedMenuItem = await newMenuItem.save(); // บันทึกเข้า MongoDB

    return NextResponse.json(savedMenuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    if (error.code === 11000) { // MongoDB duplicate key error (สำหรับ unique: true)
      return NextResponse.json({ message: 'Menu item with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}