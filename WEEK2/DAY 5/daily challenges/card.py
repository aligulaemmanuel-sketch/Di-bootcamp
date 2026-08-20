import random

class Card:
    """Represents a single playing card with a suit and a value."""
    def __init__(self, suit, value):
        self.suit = suit
        self.value = value
    
    def __repr__(self):
        return f"{self.value} of {self.suit}"

class Deck:
    """Represents a deck of 52 cards."""
    def __init__(self):
        self.suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
        self.values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        # Create the initial deck of 52 Card instances
        self.cards = [Card(s, v) for s in self.suits for v in self.values]
        # Automatically shuffle upon creation
        self.shuffle()

    def shuffle(self):
        """Rearranges the cards in the deck randomly."""
        random.shuffle(self.cards)

    def deal(self):
        """Removes and returns the top card from the deck."""
        if len(self.cards) == 0:
            print("The deck is empty!")
            return None
        return self.cards.pop()

# --- Testing the Deck ---
my_deck = Deck()
print(f"Dealt card: {my_deck.deal()}")
print(f"Cards remaining: {len(my_deck.cards)}")