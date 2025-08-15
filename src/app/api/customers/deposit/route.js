import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Customer from "../../../../../models/customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }
    
    const { customer_phone, item_name } = await req.json();

    await connectMongoDB();

    const customer = await Customer.findOneAndUpdate(
      { customer_phone },
      { $push: { drink_deposits: { item_name } } },
      { new: true } // Return the updated document
    );

    if (!customer) {
      return NextResponse.json({ message: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Drink deposit added successfully", customer_id: customer._id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}