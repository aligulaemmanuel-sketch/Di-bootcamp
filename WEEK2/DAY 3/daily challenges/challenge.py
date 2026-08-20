# Using a dictionary for the challenge requirement
french_words = ["Bonjour", "Au revoir", "Bienvenue", "A bientôt"]

# Translate to English
translations = {
    "Bonjour": "Hello",
    "Au revoir": "Goodbye",
    "Bienvenue": "Welcome",
    "A bientôt": "See you soon"
}

results = {word: translations[word] for word in french_words}
print(results)