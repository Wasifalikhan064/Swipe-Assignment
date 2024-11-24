import React from 'react'
import { useSelector } from 'react-redux';
import { Table, Card } from 'flowbite-react';

export default function InvoicesTab() {
  const invoices = useSelector(state => state.data.invoices);
 
  return (
    <Card className=" mt-6 shadow-lg">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-4">Invoices</h2>
      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.HeadCell>Serial Number</Table.HeadCell>
            <Table.HeadCell>Customer Name</Table.HeadCell>
            <Table.HeadCell>Product Name</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>Tax</Table.HeadCell>
            <Table.HeadCell>Total Amount</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {invoices.map((invoice, index) => (
              <Table.Row key={index}>
                <Table.Cell>{invoice['Serial Number']?? '---'}</Table.Cell>
                <Table.Cell>{invoice['Customer Name']?? '---'}</Table.Cell>
                <Table.Cell>{invoice['Product Name']?? '---'}</Table.Cell>
                <Table.Cell>{invoice['Quantity']?? '---'}</Table.Cell>
                <Table.Cell>{invoice['Tax']?? '---'}</Table.Cell>
                <Table.Cell>{invoice['Total Amount']?? '---'}</Table.Cell>
                <Table.Cell>{invoice['Date']?? '---'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Card>
  );
}
