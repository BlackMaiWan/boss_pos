import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }
    
    await connectMongoDB();
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}