import random

def get_words_from_file(file_path):
    with open(file_path, 'r') as f:
        # Read lines and strip newline characters
        return [line.strip() for line in f.readlines()]

def get_random_sentence(length, words_list):
    # Select 'length' number of random words
    selected = random.sample(words_list, length)
    # Join into a sentence and capitalize
    return " ".join(selected).lower().capitalize() + "."

def main():
    print("--- Random Sentence Generator ---")
    try:
        length = int(input("How long should the sentence be (2-20)? "))
        if 2 <= length <= 20:
            words = get_words_from_file('word_list.txt') # Ensure this file exists
            sentence = get_random_sentence(length, words)
            print(f"\nGenerated Sentence: {sentence}")
        else:
            print("Error: Please enter a number between 2 and 20.")
    except ValueError:
        print("Error: That wasn't a valid integer.")

if __name__ == "__main__":
    main()