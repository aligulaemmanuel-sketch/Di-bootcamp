import math

class Circle:
    def __init__(self, radius=1.0):
        self.radius = radius

    def compute_perimeter(self):
        # Perimeter = 2 * pi * r
        return 2 * math.pi * self.radius

    def compute_area(self):
        # Area = pi * r^2
        return math.pi * (self.radius ** 2)

    def print_definition(self):
        print(f"A circle is a shape consisting of all points in a plane that are at a given distance (radius) from a given point (center).")

# Example
my_circle = Circle(5)
print(f"Area: {my_circle.compute_area():.2f}")
my_circle.print_definition()