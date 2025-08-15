import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    concert_name: {
      type: String,
      required: true,
    },
    concert_date: {
      type: Date,
      required: true,
    },
    ticket_price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
export default Ticket;