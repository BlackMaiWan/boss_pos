// app/api/customers/[customer_id]/withdraw/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Customer from "../../../../../../models/customer";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    // แก้ไขตามที่ได้มีการพูดคุยไปก่อนหน้านี้: ดึงค่าจาก [customer_id]
    const { customer_id: customerId } = params; 
    
    // รับ itemId ของรายการที่ต้องการรับจาก body
    const { itemId } = await req.json();

    await connectMongoDB();

    if (!customerId || !itemId) {
      return NextResponse.json({ message: "Customer ID and Item ID are required." }, { status: 400 });
    }

    // แปลง itemId ที่เป็น String ให้เป็น ObjectId
    const itemObjectId = new ObjectId(itemId);

    // ใช้ findByIdAndUpdate และ $pull เพื่อลบรายการที่ต้องการออก
    // {new: true} จะคืนค่าเอกสารที่อัปเดตแล้ว ซึ่งจำเป็นสำหรับการตรวจสอบในขั้นตอนถัดไป
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $pull: { drink_deposits: { _id: itemObjectId } } },
      { new: true } 
    );

    if (!updatedCustomer) {
      return NextResponse.json({ message: "Customer not found." }, { status: 404 });
    }
    
    // 🚀 NEW FEATURE: ตรวจสอบว่าหลังจากรับของแล้ว มีรายการฝากเหลืออยู่หรือไม่
    if (updatedCustomer.drink_deposits && updatedCustomer.drink_deposits.length === 0) {
      
      // ถ้าไม่มีรายการเหลืออยู่ ให้ลบลูกค้าออกจากฐานข้อมูล
      await Customer.findByIdAndDelete(customerId);
      
      // ส่งการตอบกลับว่าลบรายการและลูกค้าสำเร็จ
      console.log(`Customer ${customerId} deleted because all deposits were withdrawn.`);
      return NextResponse.json({ 
        message: "Item withdrawn successfully. Customer deleted as deposits are now empty.",
        customerDeleted: true
      }, { status: 200 });
    }

    // ส่งการตอบกลับปกติ (ยังมีรายการฝากเหลืออยู่)
    return NextResponse.json({ message: "Item withdrawn successfully.", updatedCustomer }, { status: 200 });

  } catch (error) {
    console.error("Error withdrawing item:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}