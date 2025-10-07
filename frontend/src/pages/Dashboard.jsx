import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    axios
      .get("https://thewrenchking-billing-backend.onrender.com/invoices")
      .then((res) => setInvoices(res.data))
      .catch((err) => console.log(err));
  }, []);

  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);

  // Group invoices by date
  const invoicesByDate = invoices.reduce((acc, inv) => {
    const date = inv.date; // assuming format YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = { count: 0, total: 0 };
    }
    acc[date].count += 1;
    acc[date].total += inv.total;
    return acc;
  }, {});

  const sortedDates = Object.keys(invoicesByDate).sort();

  // 🔹 Break array into chunks of 7
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const dateChunks = chunkArray(sortedDates, 7);

  return (
    <div>
      <h3>Dashboard</h3>
      <p>Total Invoices: {invoices.length}</p>
      <p>Total Revenue: ₹{totalRevenue}</p>

      <h4 className="mt-4">Invoices by Date</h4>
      {dateChunks.map((chunk, idx) => (
        <table key={idx} className="table table-bordered text-center mb-4">
          <thead>
            <tr>
              {chunk.map((date) => (
                <th key={date}>{date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {chunk.map((date) => (
                <td key={date}>Invoices: {invoicesByDate[date].count}</td>
              ))}
            </tr>
            <tr>
              {chunk.map((date) => (
                <td key={date}>Revenue: ₹{invoicesByDate[date].total}</td>
              ))}
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );
}

export default Dashboard;
