import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route"; 

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {

      return new Response(JSON.stringify({ message: 'Access Denied: You do not have permission to view this page.' }), { status: 403 });
    }

    await connectMongoDB();
    const users = await User.find({}, 'uid name surname role').sort({ uid: 1 });
    
    return new Response(JSON.stringify(users), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}