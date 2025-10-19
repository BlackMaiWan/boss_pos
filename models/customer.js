import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
  {
    customer_name: {
      type: String,
      required: true,
    },
    customer_phone: {
      type: String,
      required: true,
      unique: true,
    },
    drink_deposits: {
      type: [
        {
          item_name: String,
          deposit_date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
