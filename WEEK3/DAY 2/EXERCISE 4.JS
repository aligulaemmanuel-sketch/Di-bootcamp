function hotelCost() {
    let nights;
    while (isNaN(nights) || nights === undefined) {
        nights = prompt("How many nights would you like to stay?");
    }
    return Number(nights) * 140;
}

function planeRideCost() {
    let dest = "";
    while (dest === "" || typeof dest !== "string") {
        dest = prompt("What is your destination?");
    }
    if (dest === "London") return 183;
    if (dest === "Paris") return 220;
    return 300;
}

function rentalCarCost() {
    let days;
    while (isNaN(days) || days === undefined) {
        days = prompt("How many days for the car rental?");
    }
    let cost = Number(days) * 40;
    if (days > 10) cost *= 0.95; // 5% discount
    return cost;
}

function totalVacationCost() {
    const hotel = hotelCost();
    const plane = planeRideCost();
    const car = rentalCarCost();
    console.log(`The car cost: $${car}, the hotel cost: $${hotel}, the plane tickets cost: $${plane}.`);
    return hotel + plane + car;
}

totalVacationCost();