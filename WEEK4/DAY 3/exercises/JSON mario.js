const marioGame = {
  detail : "An amazing game!",
  characters : {
      mario : {
        description: "Small and jumpy. Likes princesses.",
        height: 10,
        weight: 3,
        speed: 12,
      },
      bowser : {
        description: "Big and green, Hates princesses.",
        height: 16,
        weight: 6,
        speed: 4,
      },
      princessPeach : {
        description: "Beautiful princess.",
        height: 12,
        weight: 2,
        speed: 2,
      }
  },
};

// 1. Convert to JSON string
const marioJSON = JSON.stringify(marioGame, null, 2);

// 2. Print the JSON string
console.log(marioJSON);

/* 3. What happened to the nested objects?
In the JSON string, the nested objects (mario, bowser, princessPeach) 
are preserved as nested key-value pairs within the "characters" object.
JSON naturally supports hierarchical/nested data structures.
*/