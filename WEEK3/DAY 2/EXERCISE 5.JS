// 1. Retrieve div
const container = document.getElementById("container");
console.log(container);

// 2. Pete to Richard
document.querySelectorAll('.list')[0].children[1].textContent = "Richard";

// 3. Delete second <li> of second <ul> (Sarah)
const secondUl = document.querySelectorAll('.list')[1];
secondUl.removeChild(secondUl.children[1]);

// 4. Change first <li> to your name
const allLists = document.querySelectorAll('.list');
allLists.forEach(ul => ul.children[0].textContent = "YourName");

// 5. Classes
allLists.forEach(ul => ul.classList.add("student_list"));
allLists[0].classList.add("university", "attendance");

// 6. Styling
container.style.backgroundColor = "lightblue";
container.style.padding = "10px";

// Hide Dan (Dan is actually last in the second list after Sarah's removal)
const listItems = document.querySelectorAll('li');
listItems.forEach(li => {
    if (li.textContent === "Dan") li.style.display = "none";
    if (li.textContent === "Richard") li.style.border = "1px solid black";
});

document.body.style.fontSize = "18px";