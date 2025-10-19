import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Ticket from "../../../../models/ticket";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";

export async function GET() {
    try {

        await connectMongoDB();
        const tickets = await Ticket.find({});
        
        // แก้ไขส่วนนี้เพื่อส่งข้อมูลกลับไป
        return NextResponse.json(tickets, { status: 200 });
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// ... (ส่วนของ POST method ที่คุณมีอยู่)
export async function POST(req) {
    try {

        const {
            concert_name,
            concert_date,
            ticket_price,
            quantity,
        } = await req.json();

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!concert_name || !concert_date || !ticket_price || !quantity) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        await connectMongoDB();

        // สร้างตั๋วใหม่
        await Ticket.create({
            concert_name,
            concert_date,
            ticket_price,
            quantity,
        });

        return NextResponse.json({ message: "Ticket added successfully" }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}