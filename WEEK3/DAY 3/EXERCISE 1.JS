// Exercise 1 - JavaScript Basics

// Select DOM elements
const h1 = document.querySelector('h1');
console.log(h1);

const article = document.querySelector('article');
console.log(article);

// Example: Add event listeners
const boldBtn = document.getElementById('boldBtn');
const paragraphs = document.querySelectorAll('p');

boldBtn.addEventListener('click', function() {
    paragraphs.forEach(p => {
        p.style.fontWeight = p.style.fontWeight === 'bold' ? 'normal' : 'bold';
    });
});

// Your code here...
