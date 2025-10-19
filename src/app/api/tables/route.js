// app/api/tables/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Table from "../../../../models/Table";

// --- GET All Tables ---
export async function GET() {
  try {
    await connectMongoDB();
    // **ปรับการเรียง: เรียงตาม zone ก่อน แล้วค่อยเรียงตาม tableNumber**
    const tables = await Table.find().sort({ zone: 1, tableNumber: 1 });
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
    const { tableNumber, status, capacity, zone } = await req.json();

    if (!tableNumber || !zone) {
      return new Response(
        JSON.stringify({ message: "Table number is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ตรวจสอบว่า tableNumber ซ้ำหรือไม่
    const existingTable = await Table.findOne({ zone, tableNumber });
    if (existingTable) {
      return new Response(
        JSON.stringify({
          message: `Table ${zone}${tableNumber} already exists in Zone ${zone}.`,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const newTable = await Table.create({
      tableNumber,
      status: status || "available", // ใช้ 'available' ตาม Schema ที่ระบุไว้
      capacity: capacity || 4,
      zone: zone, // NEW: บันทึก zone
    });
    return new Response(
      JSON.stringify({
        message: `Table ${zone}${tableNumber} added successfully`,
        table: newTable,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SERVER ERROR IN POST /api/tables:", error);
    let message = "Failed to add table";
    if (error.code === 11000) {
      message =
        "Duplicate key error: Table already exists with that number/zone combination.";
      return new Response(JSON.stringify({ message }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    } else if (error.name === "ValidationError") {
      // ดึงข้อความ error จาก Mongoose Validation
      message = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
    } else {
      message = error.message;
    }
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
    const url = new URL(req.url);
    const tableNumber = url.searchParams.get("tableNumber");
    const zone = url.searchParams.get("zone"); // NEW: ดึง zone

    if (!tableNumber || !zone) {
      // NEW: ตรวจสอบ zone
      return new Response(
        JSON.stringify({
          message: "Table number and zone are required for deletion.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // FIX: ค้นหาโดยใช้ทั้ง tableNumber และ zone
    const deletedTable = await Table.findOneAndDelete({
      tableNumber: Number(tableNumber),
      zone: zone,
    });

    if (!deletedTable) {
      return new Response(
        JSON.stringify({ message: `Table ${zone}${tableNumber} not found.` }),
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
