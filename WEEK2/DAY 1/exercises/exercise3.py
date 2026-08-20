import math

class Circle:
    def __init__(self, radius=1.0):
        self.radius = radius

    def get_perimeter(self):
        return 2 * math.pi * self.radius

    def get_area(self):
        return math.pi * (self.radius ** 2)

    def describe_circle(self):
        print(f"A circle is a shape consisting of all points in a plane that are at a given distance from a given point.")

# Testing
my_circle = Circle(5)
print(f"Radius: {my_circle.radius}")
print(f"Perimeter: {my_circle.get_perimeter():.2f}")
print(f"Area: {my_circle.get_area():.2f}")
my_circle.describe_circle()


