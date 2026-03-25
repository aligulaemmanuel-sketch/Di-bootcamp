import math

class Pagination:
    def __init__(self, items=None, pageSize=10):
        self.items = items or []
        self.pageSize = int(pageSize)
        self.totalPages = math.ceil(len(self.items) / self.pageSize) if self.items else 1
        self.currentPage = 1

    def getVisibleItems(self):
        start = (self.currentPage - 1) * self.pageSize
        end = start + self.pageSize
        return self.items[start:end]

    def prevPage(self):
        self.currentPage = max(1, self.currentPage - 1)
        return self
        
    def nextPage(self):
        self.currentPage = min(self.totalPages, self.currentPage + 1)
        return self

# Example Usage
alphabetList = list("abcdefghijklmnopqrstuvwxyz")
p = Pagination(alphabetList, 4)

print(p.getVisibleItems()) # ['a', 'b', 'c', 'd']
p.nextPage()
print(p.getVisibleItems()) # ['e', 'f', 'g', 'h']