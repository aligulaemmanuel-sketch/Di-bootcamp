class Currency:
    def __init__(self, label, amount):
        self.label = label
        self.amount = amount

    def __str__(self):
        # Returns: '5 Dollars' or '10 Shekels'
        return f"{self.amount} {self.label}{'s' if self.amount != 1 else ''}"

    def __int__(self):
        return self.amount

    def __repr__(self):
        return str(self)

    def __add__(self, other):
        # Handle adding an integer
        if isinstance(other, int):
            return self.amount + other
        # Handle adding another Currency object
        elif isinstance(other, Currency):
            if self.label != other.label:
                raise TypeError(f"Cannot add between Currency type {self.label} and {other.label}")
            return self.amount + other.amount
        return NotImplemented

# Testing
c1 = Currency('dollar', 5)
c2 = Currency('dollar', 10)
print(str(c1))     # '5 dollars'
print(int(c1))     # 5
print(c1 + 5)      # 10
print(c1 + c2)     # 15