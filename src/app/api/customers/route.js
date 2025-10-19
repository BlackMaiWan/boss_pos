import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Customer from "../../../../models/customer";

export async function GET() {
  try {
    await connectMongoDB();

    // ดึงข้อมูลลูกค้าทั้งหมด
    const customers = await Customer.find({});

    // ตรวจสอบว่ามีข้อมูลลูกค้าหรือไม่
    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { message: "No customers found" },
        { status: 404 }
      );
    }

    // ส่งข้อมูลลูกค้ากลับไป (รวมถึง _id ของแต่ละรายการใน drink_deposits)
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // รับข้อมูล: ชื่อ, เบอร์, รายการฝาก
    const { customer_name, customer_phone, item_name } = await req.json();

    await connectMongoDB();

    // ใช้ findOneAndUpdate พร้อม upsert: true
    const customer = await Customer.findOneAndUpdate(
      { customer_phone }, // 1. ค้นหาด้วยเบอร์โทรศัพท์
      {
        // 2. อัปเดตชื่อ (หรือกำหนดเมื่อสร้างใหม่)
        customer_name,
        // 3. เพิ่มรายการฝากใหม่
        $push: { drink_deposits: { item_name } },
      },
      {
        new: true,
        upsert: true, // <--- สำคัญ: สร้างเอกสารใหม่หากไม่พบ
        runValidators: true,
      }
    );

    if (!customer) {
      return NextResponse.json(
        { message: "Failed to create or update customer." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "เพิ่มลูกค้าและฝากเครื่องดื่มสำเร็จ",
        customer_id: customer._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/customers POST:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error", detail: error.message },
      { status: 500 }
    );
  }
}
