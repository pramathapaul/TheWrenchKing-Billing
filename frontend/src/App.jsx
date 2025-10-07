import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./components/InvoiceForm";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="container mt-4">
        <h2 className="text-center mb-4">The Wrench King</h2>
        <nav className="mb-3">
          <Link to="/" className="btn btn-primary me-2">Dashboard</Link>
          <Link to="/invoices" className="btn btn-success me-2">Invoices</Link>
          <Link to="/new" className="btn btn-warning">New Invoice</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/new" element={<InvoiceForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
