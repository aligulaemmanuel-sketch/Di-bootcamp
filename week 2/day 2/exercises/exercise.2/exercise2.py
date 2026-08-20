import random

class MyList:
    def __init__(self, letters):
        self.letters = letters

    def reverse_list(self):
        return self.letters[::-1]

    def sorted_list(self):
        return sorted(self.letters)

    def get_random_list(self):
        # Generates a list of same length with random numbers 1-100
        return [random.randint(1, 100) for _ in range(len(self.letters))]

# Example
my_list_obj = MyList(['a', 'b', 'c', 'd'])
print(f"Reversed: {my_list_obj.reverse_list()}")
print(f"Random: {my_list_obj.get_random_list()}")