function wordsInStars() {
    const input = prompt("Enter several words separated by commas:");
    if (!input) return;

    const words = input.split(",").map(word => word.trim()).filter(word => word.length > 0);
    
    const maxLength = Math.max(...words.map(w => w.length), 0);

    const starLine = "*".repeat(maxLength + 4);

    console.log(starLine);
    for (let word of words) {
        let padding = " ".repeat(maxLength - word.length);
        console.log(`* ${word}${padding} *`);
    }
    console.log(starLine);
}

wordsInStars();