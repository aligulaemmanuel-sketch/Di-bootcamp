import os
from collections import defaultdict
from typing import List, Set

class AnagramChecker:
    def __init__(self, file_path: str = "words.txt"):
        """Initializes the checker by loading a dictionary and indexing anagrams."""
        self.word_list: Set[str] = set()
        self.anagram_map: defaultdict[str, List[str]] = defaultdict(list)

        # Resolve the path relative to the directory where this script is located
        if not os.path.isabs(file_path):
            base_dir = os.path.dirname(__file__)
            file_path = os.path.join(base_dir, file_path)

        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                word = line.strip().lower()
                if word:
                    self.word_list.add(word)
                    # Pre-calculate sorted key for O(1) anagram lookup
                    signature = "".join(sorted(word))
                    self.anagram_map[signature].append(word)

    def is_valid_word(self, word: str) -> bool:
        """Checks if a word exists in the dictionary."""
        return word.lower() in self.word_list

    def get_anagrams(self, word: str) -> List[str]:
        """Finds all anagrams for a given word using the pre-indexed map."""
        word = word.lower()
        signature = "".join(sorted(word))
        
        # Retrieve matches from map and exclude the original word
        matches = self.anagram_map.get(signature, [])
        return sorted([w for w in matches if w != word])

    @staticmethod
    def is_anagram(word1: str, word2: str) -> bool:
        """Checks if two strings are anagrams of each other."""
        if not word1 or not word2:
            return False
        return sorted(word1.lower()) == sorted(word2.lower())
