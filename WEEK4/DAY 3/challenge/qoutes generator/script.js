let quotes = [
    { id: 0, author: "Lao Tzu", quote: "Be the chief but never the lord.", likes: 0 },
    { id: 1, author: "Thomas Edison", quote: "Genius is one percent inspiration and ninety-nine percent perspiration.", likes: 0 },
    { id: 2, author: "Charles Lindbergh", quote: "Life is like a landscape. You live in the midst of it but can describe it only from the vantage point of distance.", likes: 0 },
    { id: 3, author: "Albert Einstein", quote: "Imagination is more important than knowledge.", likes: 0 },
    { id: 4, author: "Maya Angelou", quote: "Try to be a rainbow in someone's cloud.", likes: 0 },
    { id: 5, author: "Steve Jobs", quote: "Stay hungry, stay foolish.", likes: 0 },
    { id: 6, author: "Nelson Mandela", quote: "It always seems impossible until it's done.", likes: 0 },
    { id: 7, author: "Oscar Wilde", quote: "Be yourself; everyone else is already taken.", likes: 0 },
    { id: 8, author: "Eleanor Roosevelt", quote: "The future belongs to those who believe in the beauty of their dreams.", likes: 0 },
    { id: 9, author: "Confucius", quote: "It does not matter how slowly you go as long as you do not stop.", likes: 0 },
    { id: 10, author: "Walt Disney", quote: "The way to get started is to quit talking and begin doing.", likes: 0 },
    { id: 11, author: "Aristotle", quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", likes: 0 },
    { id: 12, author: "Mark Twain", quote: "The secret of getting ahead is getting started.", likes: 0 },
    { id: 13, author: "Helen Keller", quote: "Life is either a daring adventure or nothing at all.", likes: 0 },
    { id: 14, author: "Mahatma Gandhi", quote: "Be the change that you wish to see in the world.", likes: 0 },
    { id: 15, author: "Franklin D. Roosevelt", quote: "The only thing we have to fear is fear itself.", likes: 0 },
    { id: 16, author: "John Lennon", quote: "Life is what happens when you're busy making other plans.", likes: 0 },
    { id: 17, author: "Mother Teresa", quote: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", likes: 0 },
    { id: 18, author: "Robert Frost", quote: "The best way out is always through.", likes: 0 },
    { id: 19, author: "Ralph Waldo Emerson", quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.", likes: 0 },
    { id: 20, author: "Vince Lombardi", quote: "Winning isn't everything, but wanting to win is.", likes: 0 },
    { id: 21, author: "Babe Ruth", quote: "Never let the fear of striking out keep you from playing the game.", likes: 0 },
    { id: 22, author: "Wayne Gretzky", quote: "You miss 100% of the shots you don't take.", likes: 0 },
    { id: 23, author: "Henry Ford", quote: "Whether you think you can or you think you can't, you're right.", likes: 0 },
    { id: 24, author: "Oprah Winfrey", quote: "The biggest adventure you can take is to live the life of your dreams.", likes: 0 },
    { id: 25, author: "Dalai Lama", quote: "Happiness is not something ready made. It comes from your own actions.", likes: 0 },
    { id: 26, author: "Rumi", quote: "Don't be satisfied with stories, how things have gone with others. Unfold your own myth.", likes: 0 },
    { id: 27, author: "Sun Tzu", quote: "Know yourself and you will win all battles.", likes: 0 },
    { id: 28, author: "Friedrich Nietzsche", quote: "That which does not kill us makes us stronger.", likes: 0 },
    { id: 29, author: "Coco Chanel", quote: "Success is often achieved by those who don't know that failure is inevitable.", likes: 0 },
    { id: 30, author: "Leonardo da Vinci", quote: "Simplicity is the ultimate sophistication.", likes: 0 },
    { id: 31, author: "Abraham Lincoln", quote: "Whatever you are, be a good one.", likes: 0 },
    { id: 32, author: "Plato", quote: "Thinking is the talking of the soul with itself.", likes: 0 },
    { id: 33, author: "Socrates", quote: "An unexamined life is not worth living.", likes: 0 },
    { id: 34, author: "Virginia Woolf", quote: "No need to hurry. No need to sparkle. No need to be anybody but oneself.", likes: 0 },
    { id: 35, author: "Ernest Hemingway", quote: "The world breaks everyone and afterward many are strong at the broken places.", likes: 0 },
    { id: 36, author: "Harriet Tubman", quote: "Every great dream begins with a dreamer.", likes: 0 },
    { id: 37, author: "William Shakespeare", quote: "To thine own self be true.", likes: 0 },
    { id: 38, author: "Marcus Aurelius", quote: "Very little is needed to make a happy life.", likes: 0 },
    { id: 39, author: "Emily Dickinson", quote: "Forever is composed of nows.", likes: 0 },
    { id: 40, author: "Malala Yousafzai", quote: "One child, one teacher, one book, one pen can change the world.", likes: 0 },
    { id: 41, author: "Jane Austen", quote: "There is no charm equal to tenderness of heart.", likes: 0 },
    { id: 42, author: "F. Scott Fitzgerald", quote: "Never confuse a single defeat with a final defeat.", likes: 0 },
    { id: 43, author: "T.S. Eliot", quote: "Only those who will risk going too far can possibly find out how far one can go.", likes: 0 },
    { id: 44, author: "Francis Bacon", quote: "Knowledge is power.", likes: 0 },
    { id: 45, author: "Neil Armstrong", quote: "That's one small step for man, one giant leap for mankind.", likes: 0 },
    { id: 46, author: "Anne Frank", quote: "Whoever is happy will make others happy too.", likes: 0 },
    { id: 47, author: "George Bernard Shaw", quote: "Life isn't about finding yourself. Life is about creating yourself.", likes: 0 },
    { id: 48, author: "Martin Luther King Jr.", quote: "The time is always right to do what is right.", likes: 0 },
    { id: 49, author: "Søren Kierkegaard", quote: "Life can only be understood backwards; but it must be lived forwards.", likes: 0 }
];

let currentIndex = null;
let filteredSet = [];
let filteredPointer = 0;

// Update the DOM
function updateUI(q) {
    const output = document.getElementById('quote-output');
    output.innerHTML = `
        <p class="main-quote">"${q.quote}"</p>
        <p class="author-name">— ${q.author}</p>
        <small class="like-counter">Likes: ${q.likes}</small>
    `;
}

// 1. Random Generator
function generateRandom() {
    let next;
    do {
        next = Math.floor(Math.random() * quotes.length);
    } while (next === currentIndex);
    
    currentIndex = next;
    updateUI(quotes[currentIndex]);
    toggleNav(false);
}

// 2. Add Quote
document.getElementById('quote-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const qText = document.getElementById('input-quote').value;
    const aText = document.getElementById('input-author').value;
    
    quotes.push({ id: quotes.length, author: aText, quote: qText, likes: 0 });
    e.target.reset();
    alert("New quote added!");
});

// 3. Like System
function handleLike() {
    if (currentIndex !== null) {
        quotes[currentIndex].likes++;
        updateUI(quotes[currentIndex]);
    }
}

// 4. Analysis
function analyze(type) {
    if (currentIndex === null) return;
    const text = quotes[currentIndex].quote;
    if (type === 'charS') alert(`Characters: ${text.length}`);
    if (type === 'charNS') alert(`Chars (no space): ${text.replace(/\s/g, '').length}`);
    if (type === 'words') alert(`Words: ${text.trim().split(/\s+/).length}`);
}

// 5. Filter & Navigation
function filterQuotes() {
    const term = document.getElementById('filter-input').value.toLowerCase();
    filteredSet = quotes.filter(q => q.author.toLowerCase().includes(term));
    
    if (filteredSet.length > 0) {
        filteredPointer = 0;
        currentIndex = filteredSet[filteredPointer].id;
        updateUI(filteredSet[filteredPointer]);
        toggleNav(true);
    } else {
        alert("No matches found.");
    }
}

function navFiltered(dir) {
    filteredPointer += dir;
    if (filteredPointer < 0) filteredPointer = 0;
    if (filteredPointer >= filteredSet.length) filteredPointer = filteredSet.length - 1;
    
    currentIndex = filteredSet[filteredPointer].id;
    updateUI(filteredSet[filteredPointer]);
}

function toggleNav(state) {
    document.getElementById('prev-btn').disabled = !state;
    document.getElementById('next-btn').disabled = !state;
}