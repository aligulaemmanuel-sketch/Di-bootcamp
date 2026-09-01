const building = {
    numberOfFloors: 4,
    numberOfAptByFloor: {
        firstFloor: 3,
        secondFloor: 4,
        thirdFloor: 9,
        fourthFloor: 2,
    },
    nameOfTenants: ["Sarah", "Dan", "David"],
    numberOfRoomsAndRent:  {
        sarah: [3, 990],
        dan:  [4, 1000],
        david: [1, 500],
    },
}

// 2. Number of floors
console.log(building.numberOfFloors);

// 3. Apts on floors 1 and 3
console.log(building.numberOfAptByFloor.firstFloor + building.numberOfAptByFloor.thirdFloor);

// 4. Second tenant name and rooms
console.log(building.nameOfTenants[1], building.numberOfRoomsAndRent.dan[0]);

// 5. Rent check
const sarahRent = building.numberOfRoomsAndRent.sarah[1];
const davidRent = building.numberOfRoomsAndRent.david[1];
const danRent = building.numberOfRoomsAndRent.dan[1];

if (sarahRent + davidRent > danRent) {
    building.numberOfRoomsAndRent.dan[1] = 1200;
}