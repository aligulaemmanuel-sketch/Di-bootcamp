function changeEnough(itemPrice, amountOfChange) {
    const quarters = amountOfChange[0] * 0.25;
    const dimes = amountOfChange[1] * 0.10;
    const nickels = amountOfChange[2] * 0.05;
    const pennies = amountOfChange[3] * 0.01;

    const totalChange = quarters + dimes + nickels + pennies;
    return totalChange >= itemPrice;
}
console.log(changeEnough(4.25, [25, 20, 5, 0])); // true