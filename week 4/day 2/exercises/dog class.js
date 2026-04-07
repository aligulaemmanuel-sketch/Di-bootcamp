class Dog {
  constructor(name) {
    this.name = name;
  }
};

// Successful extension (Option 2 from your video)
class Labrador extends Dog {
  constructor(name, size) {
    super(name);
    this.size = size;
  }
};