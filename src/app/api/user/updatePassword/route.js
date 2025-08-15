import { connectMongoDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/user";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // *** แก้ไข path ให้ถูกต้อง ***

export async function POST(req) {
  // ตรวจสอบ Method ว่าเป็น POST หรือไม่
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    // 1. ตรวจสอบ Session และ Role ของผู้ใช้ที่เรียกใช้ API
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== 'Owner' && session.user.role !== 'Admin')) {
      return new Response(JSON.stringify({ message: 'Access Denied: You do not have permission to perform this action.' }), { status: 403 });
    }

    const { uid, newPassword } = await req.json();

    if (!uid || !newPassword) {
      return new Response(JSON.stringify({ message: 'User ID and new password are required.' }), { status: 400 });
    }

    await connectMongoDB();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { uid: uid },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ message: 'User not found.' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Password updated successfully.', uid: updatedUser.uid }), { status: 200 });

  } catch (error) {
    console.error("Error updating password:", error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}