// app/api/tables/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Table from "../../../../models/Table";

// --- GET All Tables ---
export async function GET() {
  try {
    await connectMongoDB();
    const tables = await Table.find().sort({ tableNumber: 1 }); // ดึงทั้งหมดและเรียงตามเบอร์โต๊ะ
    return new Response(JSON.stringify(tables), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to fetch tables",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// --- POST (Add New Table) ---
export async function POST(req) {
  try {
    await connectMongoDB();
    const { tableNumber, status, capacity } = await req.json();

    if (!tableNumber) {
      return new Response(
        JSON.stringify({ message: "Table number is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ตรวจสอบว่า tableNumber ซ้ำหรือไม่
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return new Response(
        JSON.stringify({
          message: `Table number ${tableNumber} already exists.`,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const newTable = await Table.create({
      tableNumber,
      status: status || "available",
      capacity: capacity || 4,
    });
    return new Response(
      JSON.stringify({ message: "Table added successfully", table: newTable }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding table:", error);
    return new Response(
      JSON.stringify({ message: "Failed to add table", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// --- DELETE Table ---
// ใช้สำหรับลบโต๊ะเดียว โดยระบุ tableNumber ใน Query Parameter
export async function DELETE(req) {
  try {
    await connectMongoDB();
    // ถ้าใช้ Pages Router: const { searchParams } = new URL(req.url); const tableNumber = searchParams.get('tableNumber');
    // ถ้าใช้ App Router: (req.query.tableNumber)
    const url = new URL(req.url);
    const tableNumber = url.searchParams.get("tableNumber");

    if (!tableNumber) {
      return new Response(
        JSON.stringify({ message: "Table number is required for deletion." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const deletedTable = await Table.findOneAndDelete({
      tableNumber: Number(tableNumber),
    });

    if (!deletedTable) {
      return new Response(
        JSON.stringify({ message: `Table number ${tableNumber} not found.` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Table deleted successfully",
        table: deletedTable,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting table:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to delete table",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
