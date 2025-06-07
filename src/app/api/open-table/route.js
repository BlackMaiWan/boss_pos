// app/api/tables/[tableNumber]/open/route.js
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { tableNumber } = params;

  // Here you would connect to your database
  // Update table status, create a new order record, etc.
  console.log(`API: Received request to open table ${tableNumber}`);

  try {
    // Example: Simulate database operation
    // In a real app, you'd save to a DB here
    const newOrderId = `ORD-<span class="math-inline">\{Date\.now\(\)\}\-</span>{tableNumber}`; // Generate a dummy order ID

    // Save status and new order ID to your database for tableNumber

    return NextResponse.json(
      {
        message: `Table ${tableNumber} opened successfully!`,
        tableNumber: parseInt(tableNumber),
        orderId: newOrderId,
        status: 'in-use',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}