import re
import sys
from anagram_checker import AnagramChecker

WORD_PATTERN = re.compile(r'^[a-zA-Z]+$')
 

def validate_single_word(word):
    word = word.strip()
    if not word:
        return False
    return bool(WORD_PATTERN.fullmatch(word))


def ask_word(prompt):
    while True:
        word = input(prompt).strip()
        if validate_single_word(word):
            return word
        print("Invalid input. Enter exactly one word using only letters.")


def main():
    print("Anagram Checker CLI")
    try:
        checker = AnagramChecker(file_path="words.txt")
    except FileNotFoundError:
        print("Error: 'words.txt' not found. Please ensure the file exists in the projects folder.")
        return

    while True:
        print("\nChoose an option:")
        print("1) Check word exists")
        print("2) Find anagrams")
        print("3) Check if two words are anagrams")
        print("4) Exit")

        choice = input("Enter choice (1-4): ").strip()

        if choice == '1':
            word = ask_word("Word: ")
            exists = checker.is_valid_word(word)
            print(f"'{word}' is {'valid' if exists else 'not found'} in dictionary.")

        elif choice == '2':
            word = ask_word("Word: ")
            anagram_list = checker.get_anagrams(word)
            if anagram_list:
                print(f"Anagrams of '{word}': {', '.join(anagram_list)}")
            else:
                print(f"No anagrams found for '{word}'.")

        elif choice == '3':
            w1 = ask_word("First word: ")
            w2 = ask_word("Second word: ")
            if checker.is_anagram(w1, w2):
                print(f"'{w1}' and '{w2}' are anagrams.")
            else:
                print(f"'{w1}' and '{w2}' are not anagrams.")

        elif choice == '4':
            print("Bye!")
            sys.exit(0)

        else:
            print("Invalid choice; enter 1-4.")


if __name__ == '__main__':
    main()
