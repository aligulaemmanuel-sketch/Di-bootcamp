// Interface & Class implementation
interface Storage<T> {
  add(item: T): void;
  get(index: number): T | undefined;
}

class Box<T> implements Storage<T> {
  private items: T[] = [];
  add(item: T): void { this.items.push(item); }
  get(index: number): T | undefined {
    if (!Number.isInteger(index) || index < 0 || index >= this.items.length) {
      return undefined;
    }
    return this.items[index];
  }
}