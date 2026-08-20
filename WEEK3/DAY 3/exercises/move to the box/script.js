function myMove() {
    let elem = document.getElementById("animate");   
    let pos = 0;
    let id = setInterval(frame, 5); // Runs every 5ms
    
    function frame() {
        if (pos == 350) { // 400px container - 50px box = 350px max
            clearInterval(id);
        } else {
            pos++; 
            elem.style.left = pos + 'px'; 
        }
    }
}