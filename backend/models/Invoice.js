// models/Invoice.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. INV-20251003-001
  customerName: { type: String, required: true },
  customerContact: { type: String, required: true },
  customerAddress: { type: String },
  vehicleName: { type: String },
  vehicleNumber: { type: String },
  items: [
    {
      name: String,
      qty: Number,
      price: Number,
      labourCharges: Number,
    },
  ],
  subtotal: Number,
  tax: Number,
  discount: Number,
  total: Number,
  isInterstate: Boolean,
  gstRate: Number,
  date: { type: String, required: true },
});

export default mongoose.model("Invoice", invoiceSchema);
