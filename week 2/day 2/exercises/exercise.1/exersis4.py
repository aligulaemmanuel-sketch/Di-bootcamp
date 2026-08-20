class Zoo:
    def __init__(self, zoo_name):
        self.name = zoo_name
        self.animals = []

    def add_animal(self, new_animal):
        if new_animal not in self.animals:
            self.animals.append(new_animal)

    def get_animals(self):
        print(f"Animals in {self.name}: {', '.join(self.animals)}")

    def sell_animal(self, animal_sold):
        if animal_sold in self.animals:
            self.animals.remove(animal_sold)

    def sort_animals(self):
        self.animals.sort()
        sorted_groups = {}
        
        for animal in self.animals:
            first_letter = animal[0].upper()
            if first_letter not in sorted_groups:
                sorted_groups[first_letter] = [animal]
            else:
                sorted_groups[first_letter].append(animal)
        
        # Mapping numerical keys to the groups as requested by the exercise logic
        return {i+1: sorted_groups[letter] for i, letter in enumerate(sorted_groups)}

    def get_groups(self):
        groups = self.sort_animals()
        for key, value in groups.items():
            print(f"{key}: {value}")

# Testing the Zoo
ramat_gan_safari = Zoo("Ramat Gan Safari")
ramat_gan_safari.add_animal("Giraffe")
ramat_gan_safari.add_animal("Ape")
ramat_gan_safari.add_animal("Baboon")
ramat_gan_safari.add_animal("Bear")
ramat_gan_safari.add_animal("Cat")
ramat_gan_safari.add_animal("Cougar")

ramat_gan_safari.get_groups()