import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "qrcode"; // ✅ QR code generator

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    axios
      .get("http://localhost:5000/invoices")
      .then((res) => {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setInvoices(sorted);
        setFiltered(sorted);
      })
      .catch((err) => console.log(err));
  };

  // Print Invoice with QR Code + Watermark
const handlePrint = async (invoice) => {
  const upiId = "8276076909-2@axl";
  const qrData = `upi://pay?pa=${upiId}&pn=TheWrenchKing&am=${invoice.total}&cu=INR`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrData);

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice #${invoice.id}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10px;
            color: #333;
            font-size: 13px;
            position: relative;
          }

          /* 🔹 Watermark */
          body::before {
            content: "";
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            background: url('/logo.jpeg') no-repeat center;
            background-size: 400px;
            opacity: 0.08;
            width: 600px;
            height: 600px;
            z-index: 0;
            pointer-events: none;
          }

          .invoice-content { position: relative; z-index: 1; }

          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
          .header img { height: 100px; }
          .company-details { text-align: right; font-size: 13px; }
          .company-details h2 { margin: 0; font-size: 18px; }
          .bill-to { display: flex; justify-content: space-between; margin: 10px 0; font-size: 13px; }
          .bill-to h3 { margin: 0 0 4px 0; font-size: 14px; }
          h1 { margin: 12px 0 6px 0; font-size: 20px; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #aaa; padding: 6px; text-align: left; }
          th { background: #f2f2f2; }
          tr:nth-child(even) { background: #fafafa; }
          .summary-qr-container { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
          .summary { width: 45%; border: 1px solid #aaa; border-radius: 5px; }
          .summary table { width: 100%; border: none; }
          .summary td { padding: 5px 8px; border: none; font-size: 13px; }
          .summary tr.total td { font-weight: bold; font-size: 14px; border-top: 2px solid #000; }
          .qr-box { text-align: center; width: 45%; }
          .qr-box img { width: 160px; height: 160px; }
          .footer { margin-top: 25px; text-align: center; font-size: 11px; color: #555; border-top: 1px dashed #aaa; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="invoice-content">
          <!-- Header -->
          <div class="header">
            <div><img src="/logo.jpeg" alt="Logo" /></div>
            <div class="company-details">
              <h2>The Wrench King</h2>
              <p>Charakdanga Barasat, Kolkata, WB - 700124</p>
              <p>Email: <b>thewrechking00@gmail.com</b></p>
              <p>Phone: +91 8276076909 | +91 8800159416</p>
            </div>
          </div>

          <!-- Bill To + Invoice Info -->
          <div class="bill-to">
            <div>
              <h3>Billed To:</h3>
              <p><b>${invoice.customerName}</b></p>
              <p>Contact: ${invoice.customerContact}</p>
              <p>Address: ${invoice.customerAddress || "Null"}</p>
              <p>Vehicle: ${invoice.vehicleName || ""} - ${invoice.vehicleNumber || ""}</p>
            </div>
            <div>
              <h3>Invoice Details</h3>
              <p><b>No:</b> ${invoice.id}</p>
              <p><b>Date:</b> ${invoice.date}</p>
            </div>
          </div>

          <!-- Items Table -->
          <h1>Invoice</h1>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Labour</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(it => `
                <tr>
                  <td>${it.name}</td>
                  <td>${it.qty}</td>
                  <td>₹${it.price}</td>
                  <td>₹${it.labourCharges}</td>
                  <td>₹${(it.qty * it.price) + Number(it.labourCharges)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <!-- Summary + QR Code -->
          <div class="summary-qr-container">
            <div class="summary">
              <table>
                <tr><td>Subtotal:</td><td>₹${invoice.subtotal}</td></tr>
                <tr><td>CGST + SGST (${invoice.tax}%):</td><td>₹${(invoice.subtotal * invoice.tax / 100).toFixed(2)}</td></tr>
                <tr><td>Discount:</td><td>₹${invoice.discount}</td></tr>
                <tr class="total"><td>Total:</td><td>₹${invoice.total}</td></tr>
              </table>
            </div>

            <div class="qr-box">
              <h3>Scan to Pay</h3>
              <img src="${qrCodeDataUrl}" alt="Payment QR" />
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Thank you for choosing <b>The Wrench King</b>!</p>
            <p>Support: <b>thewrechking00@gmail.com</b></p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};


  // 📲 WhatsApp share
  const handleWhatsApp = (invoice) => {
    const msg = `*The Wrench King*
Invoice #${invoice.id}
Customer: ${invoice.customerName}
Contact: ${invoice.customerContact}
Address: ${invoice.customerAddress}
Date: ${invoice.date}

${invoice.items
        .map(
          (it) =>
            `${it.name} (${it.qty} × ₹${it.price} + ₹${it.labourCharges} labour) = ₹${it.qty * it.price + Number(it.labourCharges)}`
        )
        .join("\n")}

Subtotal: ₹${invoice.subtotal}
GST: ${invoice.tax || 0}%
Discount: ₹${invoice.discount}
*Total: ₹${invoice.total}*`;

    const phone = invoice.customerContact.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // Delete Invoice
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`http://localhost:5000/invoices/${id}`);
      const updated = invoices.filter((inv) => inv.id !== id);
      setInvoices(updated);
      setFiltered(updated);
    } catch (err) {
      console.error("Error deleting invoice", err);
    }
  };

  const handleSearch = () => {
    if (searchId.trim() === "") {
      setFiltered(invoices);
    } else {
      const searchLower = searchId.trim().toLowerCase();
      const result = invoices.filter(
        (inv) =>
          (inv.id && inv.id.toString().toLowerCase().includes(searchLower)) ||
          (inv.customerContact.toLowerCase().includes(searchLower)) ||
          (inv.vehicleNumber.toLowerCase().includes(searchLower))
      );
      setFiltered(result);
    }
  };

  return (
  <div>
    <h3>All Invoices</h3>

    {/* Search Bar */}
    <div className="mb-3">
      <input
        type="text"
        placeholder="Search by ID, Contact, Vehicle No."
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        className="form-control d-inline w-auto me-2"
      />
      <button className="btn btn-primary" onClick={handleSearch}>
        Search
      </button>
    </div>

    {/* Card Layout Instead of Table */}
    <div className="row">
      {filtered.length > 0 ? (
        filtered.map((inv) => (
          <div className="col-12 col-md-6 col-lg-4 mb-3" key={inv.id}>
            <div className="card bg-dark text-light shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">
                  Invoice #{inv.id} – <b>₹{inv.total}</b>
                </h5>
                <h6 className="card-subtitle mb-2 text-muted">{inv.date}</h6>
                <p className="card-text mb-1">
                  <b>{inv.customerName}</b> ({inv.customerContact})
                </p>
                <p className="card-text mb-1">
                  Vehicle: {inv.vehicleName || ""} {inv.vehicleNumber}
                </p>
                <p className="card-text small">
                  {inv.items.map((it, idx) => (
                    <div key={idx}>
                      • {it.name} ({it.qty} × ₹{it.price} + ₹{it.labourCharges} labour)
                    </div>
                  ))}
                </p>

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePrint(inv)}
                  >
                    Print
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleWhatsApp(inv)}
                  >
                    WhatsApp
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(inv.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-danger">No invoice found</p>
      )}
    </div>
  </div>
);

}

export default Invoices;
