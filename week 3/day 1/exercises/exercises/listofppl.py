people = ["Greg", "Mary", "Devon", "James"]

# 1. Remove "Greg"
people.pop(0) # Equivalent to JS people.shift()

# 2. Replace "James" with "Jason"
# Python's .index() raises ValueError if item is not found, so we check first.
if "James" in people:
    james_index = people.index("James")
    people[james_index] = "Jason"

# 3. Add your name to the end
people.append("Emmanuel") # Equivalent to JS people.push()

# 4. Log Mary's index
# Python's .index() raises ValueError. To get -1 (like JS indexOf), we use a try-except.
try:
    print(people.index("Mary"))
except ValueError:
    print(-1)

# 5. Slice (copy) the list excluding Mary or your name
# Assuming "Mary" is at index 0 and your name is last.
# Python slicing [1:-1] gets elements from index 1 up to (but not including) the last.
new_people = people[1:-1] # Equivalent to JS people.slice(1, -1)

# 6. Index of "Foo" (returns -1 because it's not found)
try:
    print(people.index("Foo"))
except ValueError:
    print(-1)

# 7. Get the last element dynamically
last = people[-1] # Pythonic way to get the last element