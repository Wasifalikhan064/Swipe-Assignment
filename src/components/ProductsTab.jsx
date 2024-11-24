import { useSelector } from 'react-redux';
import { Table, Card } from 'flowbite-react';

export default function ProductsTab() {
  const products = useSelector((state) => state.data.products);

  return (
    <Card className="mt-6 shadow-lg">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-4">Products</h2>
      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.HeadCell>Product Name</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>Unit Price</Table.HeadCell>
            <Table.HeadCell>Tax</Table.HeadCell>
            <Table.HeadCell>Price with Tax</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {products.map((item, index) => (
              <Table.Row key={index} className="bg-white hover:bg-gray-50">
                <Table.Cell>{item['Product Name'] ?? '---'}</Table.Cell>
                <Table.Cell>{item['Quantity'] ?? '---'}</Table.Cell>
                <Table.Cell>{item['Unit Price'] ?? '---'}</Table.Cell>
                <Table.Cell>{item['Tax'] ?? '---'}</Table.Cell>
                <Table.Cell>{item['Price with Tax'] ?? '---'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Card>
  );
}
