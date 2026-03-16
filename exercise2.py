from itertools import groupby

user_word = "pppoeeemmm"
# groupby returns the character and the group of duplicates
# we just take the character (the 'key')
result = "".join(key for key, group in groupby(user_word))
print(result) # Output: poem