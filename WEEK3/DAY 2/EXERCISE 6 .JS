const nav = document.getElementById("navBar");
nav.setAttribute("id", "socialNetworkNavigation");

const ul = nav.querySelector("ul");
const newLi = document.createElement("li");
const logoutText = document.createTextNode("Logout");
newLi.appendChild(logoutText);
ul.appendChild(newLi);

console.log("First:", ul.firstElementChild.textContent);
console.log("Last:", ul.lastElementChild.textContent);