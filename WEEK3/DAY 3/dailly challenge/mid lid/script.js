const libButton = document.getElementById('lib-button');

libButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    const noun = document.getElementById('noun').value;
    const adj = document.getElementById('adjective').value;
    const person = document.getElementById('person').value;
    const verb = document.getElementById('verb').value;
    const place = document.getElementById('place').value;

    if (noun && adj && person && verb && place) {
        const story = `${person} went to ${place} to ${verb} a ${adj} ${noun}. It was legendary!`;
        document.getElementById('story').textContent = story;
    } else {
        alert("Please fill in all the blanks!");
    }
});