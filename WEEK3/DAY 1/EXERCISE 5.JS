const family = {
    lastName: "Smith",
    members: 4,
    city: "Paris"
};

// Keys
for (let key in family) {
    console.log(key);
}

// Values
for (let key in family) {
    console.log(family[key]);
}