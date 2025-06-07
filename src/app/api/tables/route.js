// app/api/tables/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Table from '../../../../models/Table';

export async function GET() {
  try {
    await connectMongoDB();

    const tables = await Table.find({}); // ดึงโต๊ะทั้งหมด

    return NextResponse.json(tables, { status: 200 });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}