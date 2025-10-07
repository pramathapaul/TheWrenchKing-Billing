import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
app.use("/invoices", invoiceRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Billing Backend Running...");
});

// Port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
