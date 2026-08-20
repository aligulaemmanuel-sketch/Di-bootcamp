type User = { type: 'user'; name: string; age: number };
type Product = { type: 'product'; id: number; price: number };
type Order = { type: 'order'; orderId: string; amount: number };

function handleData(data: (User | Product | Order)[]): string[] {
  return data.map(item => {
    switch (item.type) {
      case 'user':
        return `User: ${item.name}, Age: ${item.age}`;
      case 'product':
        return `Product ID: ${item.id}, Price: ${item.price}`;
      case 'order':
        return `Order ID: ${item.orderId}, Amount: ${item.amount}`;
      default:
        return "Unknown type";
    }
  });
}