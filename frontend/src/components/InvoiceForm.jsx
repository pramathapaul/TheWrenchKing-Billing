import React, { useState, useEffect } from "react";
import axios from "axios";

function InvoiceForm() {
  const [formData, setFormData] = useState(() => {
    // ✅ load draft on first render
    const draft = localStorage.getItem("invoiceDraft");
    return draft
      ? JSON.parse(draft)
      : {
          customerName: "",
          customerContact: "",
          customerAddress: "",
          vehicleName: "",
          vehicleNumber: "",
          items: [{ name: "", qty: 1, price: 0, labourCharges: 0 }],
          tax: 0,
          discount: 0,
        };
  });

  // ✅ Save draft whenever form changes
  useEffect(() => {
    localStorage.setItem("invoiceDraft", JSON.stringify(formData));
  }, [formData]);

  // ---------------- HANDLERS ----------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index][name] =
        name === "qty" || name === "price" || name === "labourCharges"
          ? Number(value)
          : value;
      return { ...prev, items: newItems };
    });
  };

  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", qty: 1, price: 0, labourCharges: 0 }],
    }));

  const removeItem = (index) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

  // ---------------- CALCULATIONS ----------------

  const subtotal = formData.items.reduce(
    (acc, item) => acc + item.qty * item.price + Number(item.labourCharges || 0),
    0
  );
  const total = subtotal + (subtotal * formData.tax) / 100 - formData.discount;

  // ---------------- SAVE ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newInvoice = {
      ...formData,
      subtotal,
      total,
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      await axios.post("https://thewrenchking-billing-backend.onrender.com/invoices", newInvoice);
      alert("✅ Invoice Saved!");

      // Clear after save
      setFormData({
        customerName: "",
        customerContact: "",
        customerAddress: "",
        vehicleName: "",
        vehicleNumber: "",
        items: [{ name: "", qty: 1, price: 0, labourCharges: 0 }],
        tax: 0,
        discount: 0,
      });
      localStorage.removeItem("invoiceDraft");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save invoice");
    }
  };

  // ---------------- UI ----------------

  return (
    <div>
      <h3>Create Invoice</h3>
      <form onSubmit={handleSubmit}>
        {/* Customer Details */}
        <div className="mb-3">
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            className="form-control"
            value={formData.customerName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Contact Number</label>
          <input
            type="text"
            name="customerContact"
            className="form-control"
            value={formData.customerContact}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Address</label>
          <input
            type="text"
            name="customerAddress"
            className="form-control"
            value={formData.customerAddress}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <label>Vehicle Name</label>
          <input
            type="text"
            name="vehicleName"
            className="form-control"
            value={formData.vehicleName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Vehicle Number</label>
          <input
            type="text"
            name="vehicleNumber"
            className="form-control"
            value={formData.vehicleNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Items */}
        {formData.items.map((item, index) => (
          <div key={index} className="d-flex mb-2 align-items-center">
            <input
              type="text"
              name="name"
              placeholder="Item Name"
              className="form-control me-2"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              name="qty"
              placeholder="Qty"
              className="form-control me-2"
              value={item.qty}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              className="form-control me-2"
              value={item.price}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              name="labourCharges"
              placeholder="Labour"
              className="form-control me-2"
              value={item.labourCharges}
              onChange={(e) => handleItemChange(index, e)}
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeItem(index)}
              disabled={formData.items.length === 1}
            >
              ❌
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={addItem}
        >
          + Add Item
        </button>

        {/* Tax + Discount */}
        <div className="mb-2">
          <label>Tax %</label>
          <input
            type="number"
            name="tax"
            className="form-control mb-2"
            value={formData.tax}
            onChange={handleInputChange}
          />

          <label>Discount</label>
          <input
            type="number"
            name="discount"
            className="form-control"
            value={formData.discount}
            onChange={handleInputChange}
          />
        </div>

        {/* Summary */}
        <h5>Subtotal: ₹{subtotal}</h5>
        <h5>Total: ₹{total}</h5>

        <button type="submit" className="btn btn-success mt-2">
          Save Invoice
        </button>
      </form>
    </div>
  );
}

export default InvoiceForm;
