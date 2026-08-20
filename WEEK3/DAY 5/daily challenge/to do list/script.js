const input = document.querySelector('#task-input');
const addBtn = document.querySelector('#add-btn');
const list = document.querySelector('#task-list');

addBtn.addEventListener('click', () => {
    if (input.value.trim() !== "") {
        const li = document.createElement('li');
        // Added transition for smoother completion toggle, and initial background
        li.className = "flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 ease-in-out";
        li.dataset.completed = "false"; // Track completion state
        
        const span = document.createElement('span');
        span.textContent = input.value;
        // Added cursor-pointer and flex-grow for better interaction and layout
        span.className = "text-gray-700 font-medium cursor-pointer flex-grow";
        
        // Add click listener to toggle completion
        span.addEventListener('click', () => {
            const isCompleted = li.dataset.completed === "true";
            li.dataset.completed = String(!isCompleted); // Toggle state

            if (!isCompleted) {
                span.classList.add('line-through', 'text-gray-400');
                span.classList.remove('text-gray-700');
                li.classList.add('bg-gray-100'); // Subtle background change for completed tasks
                li.classList.remove('bg-gray-50');
            } else {
                span.classList.remove('line-through', 'text-gray-400');
                span.classList.add('text-gray-700');
                li.classList.remove('bg-gray-100');
                li.classList.add('bg-gray-50');
            }
        });
        
        // Add a delete button to each task
        const delBtn = document.createElement('button');
        delBtn.textContent = 'X';
        // Enhanced delete button styling and added stopPropagation
        delBtn.className = "text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-full hover:bg-red-100 transition-all duration-200 ease-in-out";
        delBtn.onclick = (event) => {
            event.stopPropagation(); // Prevent task completion toggle when deleting
            li.remove();
        };
        
        li.appendChild(span); // Task text
        li.appendChild(delBtn); // Delete button
        list.appendChild(li);
        input.value = ""; // Clear input
    }
});