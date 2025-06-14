import mongoose, { Schema, model, models } from "mongoose";

const tableSchema = new Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
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
  },
  { timestamps: true }
);

const Table = models.Table || model("Table", tableSchema);

export default Table;
