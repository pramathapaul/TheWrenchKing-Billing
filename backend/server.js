import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to Neon Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test DB
pool.connect()
  .then(() => console.log("✅ Connected to Neon Postgres"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// Create table if not exists
app.get("/setup", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        customerName TEXT,
        customerContact TEXT,
        customerAddress TEXT,
        vehicleName TEXT,
        vehicleNumber TEXT,
        items JSONB,
        tax NUMERIC,
        discount NUMERIC,
        subtotal NUMERIC,
        total NUMERIC,
        date DATE
      );
    `);
    res.send("✅ Invoices table ready");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error creating table");
  }
});

// Add invoice
app.post("/invoices", async (req, res) => {
  try {
    const { customerName, customerContact, customerAddress, vehicleName, vehicleNumber, items, tax, discount, subtotal, total, date } = req.body;

    const result = await pool.query(
      `INSERT INTO invoices 
       (customerName, customerContact, customerAddress, vehicleName, vehicleNumber, items, tax, discount, subtotal, total, date) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) 
       RETURNING *`,
      [customerName, customerContact, customerAddress, vehicleName, vehicleNumber, JSON.stringify(items), tax, discount, subtotal, total, date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ error: "Error saving invoice" });
  }
});

// Fetch invoices
app.get("/invoices", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoices ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching invoices" });
  }
});

// Delete invoice
app.delete("/invoices/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM invoices WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting invoice" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
