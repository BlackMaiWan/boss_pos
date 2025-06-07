// app/api/tables/[tableNumber]/open/route.js
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { tableNumber } = params;

  console.log(`API: Received request to open table ${tableNumber}`);

  try {
    const newOrderId = `ORD-<span class="math-inline">\{Date\.now\(\)\}\-</span>{tableNumber}`;

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