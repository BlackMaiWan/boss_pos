// app/api/tables/[tableNumber]/open/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb"; // นำเข้าฟังก์ชันเชื่อมต่อ
import Table from "../../../../../../models/Table"; // <--- นำเข้า Mongoose Table Model
import Order from "../../../../../../models/Order"; // <--- นำเข้า Mongoose Order Model

export async function POST(request, context) {
  const { tableNumber } = context.params;

  try {
    await connectMongoDB();

    const table = await Table.findOne({ tableNumber: parseInt(tableNumber) });

    if (!table) {
      return NextResponse.json({ message: "Table not found" }, { status: 404 });
    }

    if (table.status === "in-use") {
      if (table.currentOrderId) {
        return NextResponse.json(
          {
            message: `Table ${tableNumber} is already in use with Order ID: ${table.currentOrderId}`,
            orderId: table.currentOrderId,
          },
          { status: 400 }
        );
      }
    }

    const newOrder = new Order({
      tableNumber: table.tableNumber,
      orderStatus: "pending",
      items: [],
      totalAmount: 0,
    });

    const savedOrder = await newOrder.save();

    table.status = "in-use";
    table.currentOrderId = savedOrder._id;
    await table.save();

    return NextResponse.json(
      {
        message: `Table ${tableNumber} opened successfully`,
        orderId: savedOrder._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error opening table ${tableNumber}:`, error);
    return NextResponse.json(
      { message: "Error opening table", error: error.message },
      { status: 500 }
    );
  }
}
