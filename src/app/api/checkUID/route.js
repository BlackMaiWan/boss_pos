import { NextResponse } from 'next/server'
import { connectMongoDB } from '../../../../lib/mongodb';
import User from '../../../../models/user';

export async function POST(req) {
    try {

        await connectMongoDB();
        const { uid } = await req.json();
        const user = await User.findOne({ uid }).select("_id");
        console.log("User: ", user)

        return NextResponse.json({ user })

    } catch(error) {
        return NextResponse.json({ message: "An error occured while registering the user." }, { status: 500 })
    }
}