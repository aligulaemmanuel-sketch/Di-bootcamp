const sentence = "The movie is not that bad, I like it";
const wordNot = sentence.indexOf("not");
const wordBad = sentence.indexOf("bad");

if (wordNot !== -1 && wordBad !== -1 && wordBad > wordNot) {
    // Extract the portion before "not" and the portion after "bad"
    const firstPart = sentence.slice(0, wordNot);
    const lastPart = sentence.slice(wordBad + "bad".length);

    console.log(`${firstPart}good${lastPart}`);
} else {
    console.log(sentence);
}