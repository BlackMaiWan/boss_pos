// app/api/orders/[orderId]/pay/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Order";
import MenuItem from "../../../../../../models/MenuItem"; // ต้อง import MenuItem ด้วย
import Table from "../../../../../../models/Table"; // ต้อง import Table ด้วย
import Ticket from "../../../../../../models/ticket"; // ถ้าคุณยังมีรายการตั๋วใน Order ก็ import ด้วย

export async function POST(req, { params }) {
  try {
    const { orderId } = params;
    // Asks the client to provide paymentMethod (e.g., 'cash', 'promptpay')
    const { paymentMethod } = await req.json();

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { message: "Order ID and payment method are required." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // 1. Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { message: "This order has already been paid." },
        { status: 400 }
      );
    }

    // 2. Update stock for all items in the order
    for (const item of order.items) {
      if (item.item_type === "MenuItem" || item.item_type === "Ticket") {
        // Find and decrement stock for menu items
        const updatedMenuItem = await MenuItem.findOneAndUpdate(
          { _id: item.item_id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedMenuItem) {
          throw new Error(`Not enough stock for menu item: ${item.item_name}.`);
        }
      }
      // หากมี item_type อื่นๆ เช่น 'Ticket' ก็เพิ่ม logic ตรงนี้
    }

    // 3. Update Order status
    order.payment_status = "paid";
    order.payment_method = paymentMethod;
    const updatedOrder = await order.save();

    // 4. Update Table status (assuming tableNumber is on Order model)
    // ใช้ tableNumber เพราะใน Order.js Schema มี field นี้
    if (order.tableNumber) {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { status: "available", currentOrderId: null }
      );
    }

    return NextResponse.json(
      {
        message: "Payment successful.",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    // Handle specific stock error
    if (error.message.includes("stock")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
