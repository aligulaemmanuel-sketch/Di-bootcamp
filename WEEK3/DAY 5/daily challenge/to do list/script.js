const input = document.querySelector('#task-input');
const taskForm = document.querySelector('#task-form');
const list = document.querySelector('.listTasks');
const tasks = [];
let idCounter = 0;

function addTask(event) {
    event.preventDefault();

    const text = input.value.trim();
    if (text === "") return;

    const task = { task_id: idCounter, text, done: false };
    tasks.push(task);

    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.dataset.taskId = task.task_id;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-task';
    deleteButton.innerHTML = '<i class="fa-solid fa-xmark" aria-label="Delete task"></i>';
    deleteButton.addEventListener('click', () => deleteTask(task.task_id));

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', () => doneTask(task.task_id));

    const label = document.createElement('label');
    label.textContent = task.text;
    label.className = 'task-text';

    taskDiv.append(deleteButton, checkbox, label);
    list.appendChild(taskDiv);
    input.value = "";
    idCounter++;
}

function doneTask(id) {
    const task = tasks.find(item => item.task_id === id);
    const taskText = document.querySelector(`[data-task-id="${id}"] .task-text`);
    if (task && taskText) {
        task.done = !task.done;
        taskText.classList.toggle('is-done', task.done);
    }
}

function deleteTask(id) {
    const taskIndex = tasks.findIndex(task => task.task_id === id);
    if (taskIndex !== -1) tasks.splice(taskIndex, 1);

    document.querySelector(`[data-task-id="${id}"]`)?.remove();
}

taskForm.addEventListener('submit', addTask);