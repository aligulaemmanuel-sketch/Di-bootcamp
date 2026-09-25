export class TodoList {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push({ task, completed: false });
    }

    markComplete(index) {
        if (this.tasks[index]) {
            this.tasks[index].completed = true;
        }
    }

    listTasks() {
        this.tasks.forEach((t, i) => {
            console.log(`${i}: [${t.completed ? 'X' : ' '}] ${t.task}`);
        });
    }
}
import { TodoList } from './todo.js';

const myTodos = new TodoList();
myTodos.addTask("Buy milk");
myTodos.addTask("Learn Node.js");
myTodos.markComplete(0);
myTodos.listTasks();