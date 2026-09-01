const allBooks = [
    {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        image: "https://example.com/hobbit.jpg",
        alreadyRead: true
    },
    {
        title: "1984",
        author: "George Orwell",
        image: "https://example.com/1984.jpg",
        alreadyRead: false
    }
];

const section = document.querySelector(".listBooks");

allBooks.forEach(book => {
    const div = document.createElement("div");
    const info = document.createElement("p");
    const img = document.createElement("img");

    info.textContent = `${book.title} written by ${book.author}`;
    img.src = book.image;
    img.style.width = "100px";

    if (book.alreadyRead) {
        info.style.color = "red";
    }

    div.appendChild(info);
    div.appendChild(img);
    section.appendChild(div);
});