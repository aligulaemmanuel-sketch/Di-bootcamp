import random

class Gene:
    def __init__(self):
        self.value = random.choice([0, 1])
    
    def mutate(self):
        self.value = 1 if self.value == 0 else 0

class Chromosome:
    def __init__(self):
        self.genes = [Gene() for _ in range(10)]
    
    def mutate(self):
        for gene in self.genes:
            if random.random() < 0.5: # 50% chance to mutate
                gene.mutate()

class DNA:
    def __init__(self):
        self.chromosomes = [Chromosome() for _ in range(10)]
    
    def mutate(self):
        for chrom in self.chromosomes:
            if random.random() < 0.5:
                chrom.mutate()

# Testing mutation
my_dna = DNA()
print(f"Initial Gene Value: {my_dna.chromosomes[0].genes[0].value}")
my_dna.mutate()
print(f"After Mutation: {my_dna.chromosomes[0].genes[0].value}")