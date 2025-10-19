import mongoose, { Schema, model, models } from "mongoose";

const orderItemSchema = new Schema({
  // ใช้ item_id และ item_type เพื่ออ้างอิงถึงสินค้าที่มาจากหลายรุ่น
  item_id: { type: Schema.Types.ObjectId, required: true },
  item_type: { type: String, enum: ['Ticket', 'MenuItem'], required: true },
  
  // ข้อมูลที่จำเป็นของสินค้า
  item_name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min:0},
  notes: { type: String }, // สำหรับเมนูอาหาร เช่น 'ไม่ใส่ผักชี'
});

const orderSchema = new Schema({
  // รายการสินค้าในคำสั่งซื้อ (ตั๋วหรืออาหาร)
  items: [orderItemSchema],
  
  // ยอดรวมของคำสั่งซื้อ
  total_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // สถานะการชำระเงิน
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  
  // วิธีการชำระเงิน
  payment_method: {
    type: String,
    enum: ['cash', 'promptpay'],
    default: null,
  },
  
  // หากใช้ในระบบร้านอาหาร คุณสามารถเพิ่มฟิลด์นี้ได้
  tableNumber: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

const Order = models.Order || model('Order', orderSchema);

export default Order;