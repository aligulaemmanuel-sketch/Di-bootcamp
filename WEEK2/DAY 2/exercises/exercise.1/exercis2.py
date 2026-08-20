class Dog:
    def __init__(self, name, height):
        self.name = name
        self.height = height

    def bark(self):
        print(f"{self.name} goes woof!")

    def jump(self):
        # Jump height is height * 2
        print(f"{self.name} jumps {self.height * 2} cm high!")

# Step 2: Create objects
davids_dog = Dog("Rex", 50)
sarahs_dog = Dog("Teacup", 20)

# Step 3: Call methods
davids_dog.bark()
davids_dog.jump()

# Step 4: Compare sizes
if davids_dog.height > sarahs_dog.height:
    print(f"The bigger dog is {davids_dog.name}")
else:
    print(f"The bigger dog is {sarahs_dog.name}")