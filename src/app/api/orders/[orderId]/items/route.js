// app/api/orders/[orderId]/items/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Order from '../../../../../../models/Order';
import MenuItem from '../../../../../../models/MenuItem';

export async function POST(request, context) {
  const { orderId } = context.params;
  const { menuItemId, name, price, quantity } = await request.json();

  try {
    await connectMongoDB();

    // 1. ดึง MenuItem ปัจจุบันเพื่อตรวจสอบสต็อกก่อน
    // ใช้ findByIdAndUpdate เพื่อลด stock และตั้งค่า isAvailable ในคราวเดียว
    // และยังสามารถตรวจสอบสต็อกใน query ได้เลย
    const updatedMenuItem = await MenuItem.findOneAndUpdate(
        { _id: menuItemId, stock: { $gte: quantity } }, // <-- ตรวจสอบสต็อกตรงนี้
        { $inc: { stock: -quantity }}, //ลดสต็อก
        { new: true } // คืนค่า Document ที่อัปเดตแล้ว
    );

    if (!updatedMenuItem) {
        // ถ้า stock ไม่พอ ($gte: quantity) หรือไม่พบ menuItem จะเข้ามาตรงนี้
        return NextResponse.json({ message: 'Not enough stock for this item or menu item not found' }, { status: 400 });
    }

    // หาก updatedMenuItem.stock เป็น 0 หลังจากการลด ให้ตั้ง isAvailable เป็น false
    if (updatedMenuItem.stock === 0) {
        updatedMenuItem.isAvailable = false;
        await updatedMenuItem.save(); // บันทึกการเปลี่ยนแปลง isAvailable
    }
    // ไม่ต้องบันทึกอีกครั้ง ถ้า updateOne/findOneAndUpdate ทำไปแล้ว

    // 4. ค้นหา Order (หรือสร้างถ้าไม่มี)
    let order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // 5. เพิ่มหรืออัปเดตรายการใน Order
    const existingItemIndex = order.items.findIndex(item => String(item.menuItemId) === String(menuItemId));

    if (existingItemIndex > -1) {
      order.items[existingItemIndex].quantity += quantity;
      order.items[existingItemIndex].subtotal = order.items[existingItemIndex].quantity * order.items[existingItemIndex].price; // ใช้ subtotal
    } else {
      order.items.push({
        menuItemId: menuItemId,
        name: name,
        price: price,
        quantity: quantity,
        subtotal: price * quantity, // ใช้ subtotal
      });
    }

    // 6. คำนวณ totalAmount ใหม่
    order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

    // 7. บันทึก Order ที่อัปเดตแล้ว
    const updatedOrder = await order.save();

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('Error adding item to order:', error);
    // ตรวจจับ Mongoose duplicate key errors หรือ validation errors
    if (error.name === 'ValidationError') {
        return NextResponse.json({ message: 'Validation Error: ' + error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}