import math

# Formula Exercise
# Q = Square root of [(2 * C * D)/H] where C=50, H=30
C = 50
H = 30
d_values = input("Enter numbers (comma-separated): ").split(',')

results = []
for D in d_values:
    Q = math.sqrt((2 * C * int(D)) / H)
    results.append(str(int(Q)))

print(",".join(results))