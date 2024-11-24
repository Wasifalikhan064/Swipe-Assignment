import React from 'react'
import {BrowserRouter,Route,Routes} from 'react-router-dom';
import InvoicesTab from './components/InvoicesTab'
import ProductsTab from './components/ProductsTab';
import CustomersTab from './components/CustomersTab'
import Navbar from './components/Navbar'
import Header from './components/Header';

export default function App() {
  return (
    <BrowserRouter>
    <Header />
    <Navbar />
    <Routes>
      <Route path="/" element={<InvoicesTab />} />
      <Route path="/products" element={<ProductsTab />} />
      <Route path="/customers" element={<CustomersTab />} />
    </Routes>
    </BrowserRouter>
  )
}
