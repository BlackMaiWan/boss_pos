import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Ticket from "../../../../../models/ticket";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
            return NextResponse.json({ message: "Access Denied" }, { status: 403 });
        }

        const { ticket_id } = await req.json(); // <-- แก้ไขตรงนี้ให้รับข้อมูลที่ถูกต้อง

        await connectMongoDB();

        // ค้นหาตั๋วตาม ID
        const ticket = await Ticket.findById(ticket_id);
        if (!ticket) {
            return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
        }

        // เช็คจำนวนคงเหลือของตั๋ว
        if (ticket.quantity <= 0) {
            return NextResponse.json({ message: "Out of stock" }, { status: 400 });
        }

        // ลดจำนวนตั๋วลง 1 ใบ
        ticket.quantity -= 1;
        await ticket.save();

        return NextResponse.json({ message: "Ticket sold successfully" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}