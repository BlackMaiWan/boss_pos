import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Ticket from "../../../../../models/ticket";
import Customer from "../../../../../models/customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const { ticket_id, customer_name, customer_phone } = await req.json();

    await connectMongoDB();

    const ticket = await Ticket.findById(ticket_id);
    if (!ticket || ticket.quantity <= 0) {
      return NextResponse.json({ message: "Ticket not available or out of stock" }, { status: 400 });
    }

    let customer = await Customer.findOne({ customer_phone });

    if (!customer) {
      customer = await Customer.create({ customer_name, customer_phone });
    }

    customer.bought_tickets.push({ ticket_id, quantity: 1, purchase_date: new Date() });
    await customer.save();

    ticket.quantity -= 1;
    await ticket.save();

    return NextResponse.json({ message: "Ticket sold successfully", customer_id: customer._id }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}