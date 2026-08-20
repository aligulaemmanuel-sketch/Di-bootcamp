// Example access for Exercise 4
console.log(building.numberOfFloors); // Total floors
console.log(building.numberOfApartments.firstFloor); // Apartments on floor 1
console.log(building.numberOfApartments.thirdFloor); // Apartments on floor 3

// Check if Sarah's rent + David's rent > Dan's rent
let sarahRent = building.numberOfRoomsAndRent.sarah[1];
let davidRent = building.numberOfRoomsAndRent.david[1];
let danRent = building.numberOfRoomsAndRent.dan[1];

if (sarahRent + davidRent > danRent) {
    building.numberOfRoomsAndRent.dan[1] = 1200;
}