const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop page refresh

    const firstName = document.getElementById('fname').value.trim();
    const lastName = document.getElementById('lname').value.trim();
    const ul = document.querySelector('.usersAnswer');

    if (firstName !== "" && lastName !== "") {
        const liFirst = document.createElement('li');
        const liLast = document.createElement('li');
        
        liFirst.textContent = firstName;
        liLast.textContent = lastName;
        
        ul.appendChild(liFirst);
        ul.appendChild(liLast);
    }
});