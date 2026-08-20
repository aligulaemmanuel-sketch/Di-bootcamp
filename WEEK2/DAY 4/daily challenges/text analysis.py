import re
from collections import Counter

class Text:
    def __init__(self, text_string):
        self.text = text_string
        # Clean text: lowercase and remove basic punctuation for analysis
        self.words = re.sub(r'[^\w\s]', '', self.text.lower()).split()

    def word_frequency(self, word):
        count = self.words.count(word.lower())
        return count if count > 0 else f"The word '{word}' is not in the text."

    def most_common_word(self):
        if not self.words:
            return None
        return Counter(self.words).most_common(1)[0][0]

    def unique_words(self):
        return list(set(self.words))

    @classmethod
    def from_file(cls, filename):
        with open(filename, 'r') as f:
            content = f.read()
        return cls(content)

# Bonus: Inheritance
class TextModification(Text):
    def remove_punctuation(self):
        # Using regex to keep only alphanumeric and spaces
        return re.sub(r'[^\w\s]', '', self.text)

    def remove_stopwords(self):
        # Common English stop words
        stops = ["the", "a", "in", "on", "is", "be", "if"]
        filtered = [w for w in self.words if w not in stops]
        return " ".join(filtered)