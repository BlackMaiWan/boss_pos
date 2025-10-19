import mongoose, { Schema, model, models } from "mongoose";

const tableSchema = new Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "in-use"], // กำหนดสถานะที่เป็นไปได้
      default: "available",
    },
    lastOpened: {
      type: Date,
      default: null,
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    capacity: {
      type: Number,
      default: 4,
    },
    zone: {
      type: String,
      required: true,
      trim: true,
      default: "A", // ค่าเริ่มต้น
    },
  },
  { timestamps: true }
);

tableSchema.index({ zone: 1, tableNumber: 1 }, { unique: true });

const Table = models.Table || model("Table", tableSchema);

export default Table;
