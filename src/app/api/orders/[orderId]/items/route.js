// app/api/orders/[orderId]/items/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Order from '../../../../../../models/Order';
import MenuItem from '../../../../../../models/MenuItem';

export async function POST(request, { params }) {
  const { orderId } = await params;
  const { menuItemId, name, price, quantity } = await request.json();

  try {
    await connectMongoDB();

    // ดึง MenuItem ปัจจุบันเพื่อตรวจสอบสต็อกก่อน
    const updatedMenuItem = await MenuItem.findOneAndUpdate(
        { _id: menuItemId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity }},
        { new: true }
    );

    if (!updatedMenuItem) {
        return NextResponse.json({ message: 'Not enough stock for this item or menu item not found' }, { status: 400 });
    }

    if (updatedMenuItem.stock === 0) {
        updatedMenuItem.isAvailable = false;
        await updatedMenuItem.save();
    }

    let order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const existingItemIndex = order.items.findIndex(item => String(item.menuItemId) === String(menuItemId));

    const newSubtotal = price * quantity

    if (existingItemIndex > -1) {
      order.items[existingItemIndex].quantity += quantity;
      order.items[existingItemIndex].subtotal = order.items[existingItemIndex].quantity * order.items[existingItemIndex].price; // ใช้ subtotal
    } else {
      order.items.push({
        item_id: menuItemId,
        item_name: name,
        price: price,
        quantity: quantity,
        subtotal: newSubtotal,
        item_type: 'MenuItem'
      });
    }

    order.total_amount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

    const updatedOrder = await order.save();

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('Error adding item to order:', error);
    if (error.name === 'ValidationError') {
        return NextResponse.json({ message: 'Validation Error: ' + error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}