// 1. Interface: Book
interface Book {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre?: string; // Optional property
}

// 2. Class: Library
class Library {
  private books: Book[]; // Private property: array of Book objects

  constructor() {
    this.books = [];
  }

  // Public method to add a book
  public addBook(book: Book): void {
    this.books.push(book);
  }

  // Public method to get book details by ISBN
  public getBookDetails(isbn: string): string {
    const book = this.books.find(b => b.isbn === isbn);
    if (book) {
      return `Title: ${book.title}, Author: ${book.author}, Year: ${book.publishedYear}`;
    }
    return "Book not found.";
  }

  // Helper method for the subclass to access titles
  protected getAllTitles(): string[] {
    return this.books.map(book => book.title);
  }
}

// 3. Class: DigitalLibrary (extends Library)
class DigitalLibrary extends Library {
  readonly website: string; // Readonly property

  constructor(website: string) {
    super();
    this.website = website;
  }

  // Public method to list all book titles
  public listBooks(): string[] {
    return this.getAllTitles();
  }
}

// --- Implementation ---

const myDigitalLibrary = new DigitalLibrary("https://asuva-library.com");

myDigitalLibrary.addBook({
  title: "The TypeScript Guide",
  author: "Jane Doe",
  isbn: "123-456",
  publishedYear: 2024,
  genre: "Education"
});

myDigitalLibrary.addBook({
  title: "Cloud Systems 101",
  author: "John Smith",
  isbn: "789-012",
  publishedYear: 2023
});

console.log(`Library Website: ${myDigitalLibrary.website}`);
console.log("All Books:", myDigitalLibrary.listBooks());
console.log("Searching ISBN 123-456:", myDigitalLibrary.getBookDetails("123-456"));