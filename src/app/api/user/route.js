import { connectMongoDB } from "../../../../lib/mongodb"; // ปรับ path ตามโครงสร้างของคุณ
import User from "../../../../models/user"; // ปรับ path ตามโครงสร้างของคุณ
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route"; 

export async function GET(req) {
  try {
    // 1. ตรวจสอบ Session และ Role ของผู้ใช้
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      // ถ้าไม่มี session หรือ role ไม่ใช่ Owner/Admin ให้ปฏิเสธการเข้าถึง
      return new Response(JSON.stringify({ message: 'Access Denied: You do not have permission to view this page.' }), { status: 403 });
    }

    // 2. เชื่อมต่อฐานข้อมูลและดึงข้อมูลผู้ใช้
    await connectMongoDB();
    const users = await User.find({}, 'uid name surname role').sort({ uid: 1 });
    
    return new Response(JSON.stringify(users), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}