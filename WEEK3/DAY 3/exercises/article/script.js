// 1. Get h1 and log it
const mainTitle = document.querySelector('h1');
console.log(mainTitle);

// 2. Remove last paragraph
const article = document.querySelector('article');
article.lastElementChild.previousElementSibling.remove(); 

// 3. Change h2 background to red on click
const h2 = document.querySelector('h2');
h2.addEventListener('click', () => {
    h2.style.backgroundColor = 'red';
});

// 4. Hide h3 on click
const h3 = document.querySelector('h3');
h3.addEventListener('click', () => {
    h3.style.display = 'none';
});

// 5. Button to make all paragraphs bold
const boldBtn = document.getElementById('bold-btn');
boldBtn.addEventListener('click', () => {
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => p.style.fontWeight = 'bold');
});