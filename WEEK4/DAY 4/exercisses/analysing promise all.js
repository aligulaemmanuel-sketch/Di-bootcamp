function timesTwoAsync(x) {
    return new Promise((resolve) => resolve(x * 2));
}

const arr = [1, 2, 3];

// Create an array of promises: [timesTwoAsync(1), timesTwoAsync(2), timesTwoAsync(3)]
const promiseArr = arr.map(timesTwoAsync);

Promise.all(promiseArr)
    .then((result) => {
        console.log(result); 
        // Output: [2, 4, 6]
    });