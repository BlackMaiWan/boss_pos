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
    bought_tickets: {
      type: [{
        ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket' },
        quantity: Number,
        purchase_date: { type: Date, default: Date.now },
      }],
      default: [],
    },
    drink_deposits: {
      type: [{
        item_name: String,
        deposit_date: { type: Date, default: Date.now },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;