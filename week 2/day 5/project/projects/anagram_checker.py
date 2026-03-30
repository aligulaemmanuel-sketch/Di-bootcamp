import os

class AnagramChecker:
    def __init__(self, file_path="words.txt"):
        # Resolve the path relative to the directory where this script is located
        if not os.path.isabs(file_path):
            base_dir = os.path.dirname(__file__)
            file_path = os.path.join(base_dir, file_path)

        with open(file_path, 'r', encoding='utf-8') as f:
            self.word_list = {word.strip().lower() for word in f if word.strip()}

    def is_valid_word(self, word):
        return word.lower() in self.word_list

    def get_anagrams(self, word):
        word = word.lower()
        target_sorted = sorted(word)
        anagrams = []

        for w in self.word_list:
            if w != word and sorted(w) == target_sorted:
                anagrams.append(w)
        return sorted(anagrams)

    @staticmethod
    def is_anagram(word1, word2):
        return sorted(word1.lower()) == sorted(word2.lower())
