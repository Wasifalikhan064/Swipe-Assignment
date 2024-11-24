import React from 'react'
import { useSelector } from 'react-redux';
import { Table, Card } from 'flowbite-react';
export default function CustomersTab() {
  const customers = useSelector(state => state.data.customers);

  return (
    <Card className="mt-6 shadow-lg">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-4">Customers</h2>
      <div className="overflow-x-auto">
      <Table >
          <Table.Head>
            <Table.HeadCell>Customer Name</Table.HeadCell>
            <Table.HeadCell>Phone Number</Table.HeadCell>
            <Table.HeadCell>Total Purchase Amount</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {customers.map((customer, index) => (
              <Table.Row key={index} className="bg-white hover:bg-gray-50">
                <Table.Cell>{customer['Customer Name']?? '---'}</Table.Cell>
                <Table.Cell>{customer['Phone Number']?? '---'}</Table.Cell>
                <Table.Cell>{customer['Total Purchase Amount']?? '---'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Card>
  );
}
