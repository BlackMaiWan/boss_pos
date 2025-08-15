import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Ticket from "../../../../models/ticket";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";

// GET all tickets
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }
    await connectMongoDB();
    const tickets = await Ticket.find({});
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create a new ticket
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }
    const { concert_name, concert_date, ticket_price, quantity } = await req.json();
    await connectMongoDB();
    await Ticket.create({ concert_name, concert_date, ticket_price, quantity });
    return NextResponse.json({ message: "Ticket created successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}