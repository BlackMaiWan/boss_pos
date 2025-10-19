// app/api/reports/orders/route.js (แก้ไข)
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";

export async function GET(req) {
  try {
    await connectMongoDB();

    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'daily';
    const startDateParam = url.searchParams.get('startDate'); 
    const endDateParam = url.searchParams.get('endDate');   
    
    let dateFilter = {};

    if (startDateParam && endDateParam) {
        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        
        // ต้องเพิ่ม 1 วันใน EndDate เพื่อให้ครอบคลุมถึงสิ้นวันของวันที่เลือก
        endDate.setDate(endDate.getDate() + 1); 

        dateFilter = { 
            $gte: startDate, // มากกว่าหรือเท่ากับ Start Date
            $lt: endDate     // น้อยกว่า End Date (ถัดไปอีก 1 วัน)
        };
    }
    
    // สร้างเงื่อนไขการค้นหา: สถานะ 'paid' และเงื่อนไขวันที่
    const query = {
        payment_status: 'paid',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    // 💡 FIX: เพิ่ม .select() เพื่อดึงฟิลด์ที่จำเป็นสำหรับรายงานและกราฟ
    const orders = await Order.find(query)
      .select('tableNumber total_amount createdAt payment_method') // <--- เพิ่ม payment_method ตรงนี้
      .sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}