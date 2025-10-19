import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Ticket from "../../../../models/ticket"; // ถ้าคุณยังต้องการอัปเดตสต็อกทันทีที่สร้าง Order
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";

// POST create a new Order
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    const { items, total_amount, customer_id } = await req.json(); // เปลี่ยนให้รับ customer_id เป็น optional

    if (!items || items.length === 0 || !total_amount) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
    }

    await connectMongoDB();

    // ตรวจสอบสต็อกตั๋ว (ถ้าจำเป็น) ก่อนสร้าง Order
    for (const item of items) {
        // Find the original item (ticket) to check quantity
        const originalItem = await Ticket.findById(item.item_id);
        if (!originalItem || originalItem.quantity < item.quantity) {
            return NextResponse.json({ message: `Insufficient stock for ${item.item_name}` }, { status: 400 });
        }
    }
    
    // สร้าง Order ใหม่ในสถานะ 'pending'
    const newOrder = await Order.create({
      items: [],
      total_amount,
      customer: customer_id || null, // ถ้าเป็นตั๋วก็ไม่ต้องใส่
      payment_method: null,
      payment_status: 'pending' 
    });

    return NextResponse.json({ message: "Order created successfully", orderId: newOrder._id }, { status: 201 });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}