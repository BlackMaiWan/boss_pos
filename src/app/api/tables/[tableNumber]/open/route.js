import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Order";
import Table from "../../../../../../models/Table";

// Note: In Next.js App Router, you can destructure params directly
export async function POST(request, { params }) {
  const { tableNumber } = await params;

  const { zone } = await request.json();

  const tableQuery = {
    tableNumber: Number(tableNumber),
    zone: zone,
  };

  try {
    await connectMongoDB();

    if (!zone) {
      return NextResponse.json(
        { message: "Zone is required to open a table." },
        { status: 400 }
      );
    }

    const existingOrder = await Order.findOne({
      tableNumber: Number(tableNumber),
      status: "open",
    });
    const tableToCheck = await Table.findOne(tableQuery);
    if (!tableToCheck) {
      return NextResponse.json(
        { message: `Table ${zone}${tableNumber} not found.` },
        { status: 404 }
      );
    }

    if (tableToCheck.status === "in-use") {
      return NextResponse.json(
        { message: `Table ${zone}${tableNumber} is already open (in-use).` },
        { status: 400 }
      );
    }

    // 1. Create a new order with initial total_amount
    const newOrder = await Order.create({
      tableNumber: Number(tableNumber),
      zone: zone,
      total_amount: 0,
      items: [],
    });

    // 2. Update the corresponding table to 'in-use' and link the new orderId
    const updatedTable = await Table.findOneAndUpdate(
      tableQuery, // <--- ใช้ Zone + TableNumber
      { status: "in-use", currentOrderId: newOrder._id },
      { new: true }
    );

    if (!updatedTable) {
      // Rollback the created order if table update fails
      await Order.findByIdAndDelete(newOrder._id);
      throw new Error(`Table ${zone}${tableNumber} not found (after creation check).`);
    }

    return NextResponse.json(
      {
        message: `Table ${tableNumber} opened successfully.`,
        orderId: newOrder._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error opening table ${tableNumber} in zone ${zone}:`, error);
    return NextResponse.json(
      { message: "Error opening table", error: error.message },
      { status: 500 }
    );
  }
}
