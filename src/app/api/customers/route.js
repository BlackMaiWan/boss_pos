import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Customer from "../../../../models/customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";

// GET all customers with their purchases and deposits
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }
    await connectMongoDB();
    const customers = await Customer.find({})
      .populate('bought_tickets.ticket_id', 'concert_name ticket_price');
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create a new customer and a new drink deposit
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }
    
    // ตรวจสอบว่า request body มีข้อมูลหรือไม่
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    console.log("Request object received:", req);
    console.log("Request body:", req.body);
    
    const { customer_name, customer_phone, item_name } = body;

    if (!customer_name || !customer_phone || !item_name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectMongoDB();

    let customer = await Customer.findOne({ customer_phone });
    if (customer) {
      return NextResponse.json({ message: "Customer with this phone number already exists." }, { status: 400 });
    }
    
    customer = await Customer.create({
      customer_name,
      customer_phone,
      drink_deposits: [{ item_name }]
    });

    return NextResponse.json({ message: "Customer created with new drink deposit successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/customers:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}