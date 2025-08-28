import mongoose, { Schema, model, models } from "mongoose";

const menuItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Drink', 'Snack', 'Other'],  //Wisky, Beer
  },
  imageUrl: {
    type: String,
    default: "",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0, // จำนวนต้องไม่ติดลบ
    default: 0, // ค่าเริ่มต้นเป็น 0
  }
}, { timestamps: true });

const MenuItem = models.MenuItem || model('MenuItem', menuItemSchema);

export default MenuItem;