import mongoose, { Schema, model, models } from "mongoose";

const orderSchema = new Schema({
  tableNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'preparing', 'served', 'paid', 'canceled'],
    default: 'open',
  },
  items: [ // Array of order items
    {
      menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true }, // อ้างอิงถึง MenuItem
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      subtotal: { type: Number, required: true, min: 0 }, // ราคาสำหรับรายการนี้ (quantity * price)
      notes: String, // เช่น "ไม่ใส่ผักชี"
    }
  ],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  openedAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

const Order = models.Order || model('Order', orderSchema);

export default Order;