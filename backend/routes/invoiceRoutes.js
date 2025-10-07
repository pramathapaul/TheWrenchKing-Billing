// routes/invoiceRoutes.js
import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

/**
 * 📌 Get all invoices (sorted by newest first)
 */
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("❌ Error fetching invoices:", err);
    res.status(500).json({ error: "Error fetching invoices" });
  }
});

/**
 * 📌 Add new invoice (auto-generate invoice ID)
 */
router.post("/", async (req, res) => {
  try {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

    // Get invoices for today
    const todayInvoices = await Invoice.find({ id: { $regex: `^INV-${datePart}` } });
    
    // Find highest sequence for today
    let seq = 1;
    if (todayInvoices.length > 0) {
      const lastSeq = Math.max(
        ...todayInvoices.map((inv) => {
          const parts = inv.id.split("-");
          return parseInt(parts[parts.length - 1], 10) || 0;
        })
      );
      seq = lastSeq + 1;
    }

    const newId = `INV-${datePart}-${String(seq).padStart(3, "0")}`;

    const newInvoice = new Invoice({
      id: newId,
      ...req.body,
    });

    const saved = await newInvoice.save();
    res.json(saved);
  } catch (err) {
    console.error("❌ Error saving invoice:", err);
    res.status(500).json({ error: "Error saving invoice", details: err.message });
  }
});

/**
 * 📌 Delete an invoice
 */
router.delete("/:id", async (req, res) => {
  try {
    await Invoice.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting invoice:", err);
    res.status(500).json({ error: "Error deleting invoice" });
  }
});

export default router;
