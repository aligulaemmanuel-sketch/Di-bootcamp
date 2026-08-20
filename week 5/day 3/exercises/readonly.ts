class Product {
  readonly id: number; // Cannot be modified after initialization
  public name: string;
  public price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  getProductInfo(): string {
    return `Product: ${this.name}, Price: $${this.price}`;
  }
}

const item = new Product(101, "Laptop", 1200);
// item.id = 102; // This would throw a TypeScript error!