matrix_string = """7i3
Ts n
i #
sM 
$a 
#t%
^r!
i  """

# Convert string to a grid
rows = matrix_string.split('\n')
column_count = len(rows[0])
hidden_message = ""

# Iterate column by column
for col in range(column_count):
    for row in rows:
        char = row[col]
        if char.isalpha():
            hidden_message += char
        else:
            # Replace non-alpha groups with a single space
            if hidden_message and hidden_message[-1] != " ":
                hidden_message += " "

print(f"Decoded Message: {hidden_message.strip()}")