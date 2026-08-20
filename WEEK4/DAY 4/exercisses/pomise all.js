const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 3000, 'foo');
});

// Promise.all takes an array of promises
Promise.all([promise1, promise2, promise3])
    .then((values) => {
        console.log(values); 
        // Expected output: [3, 42, "foo"]
    })
    .catch((error) => {
        console.log("One of the promises failed:", error);
    });

