import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import bcrypt from 'bcryptjs';

export async function POST(req){
    try{
        const { uid, name, surname, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);

        await connectMongoDB();
        await User.create({ uid, name, surname, password: hashedPassword });

        console.log("UID:", uid);
        console.log("Name:", name);
        console.log("Surname:", surname);
        console.log("Password:", password);

        return NextResponse.json({ message: "User registered."},{ status: 201 })
    
    } catch(error){
        return NextResponse.json({ message: "An error occurred while registrating the user."}, {status: 500});
    }
}