// ===================== DOM Selectors =====================
const container = document.querySelector(".container");
const footer = document.querySelector("footer");
const input = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.querySelector(".todo-list");
const showAllBtn = document.querySelector(".show-all-btn");
const filterBtns = document.querySelectorAll(".filter-group button");
const taskCounter = document.querySelector(".task-counter");

// ===================== State Management =====================
let tasks = [];
let currentFilter = "all";
let isShowingAll = false;
const TASKS_TO_SHOW_INITIALLY = 3;

// ===================== LocalStorage Functions =====================

// Fetches tasks from the browser's local storage
function fetchTasksFromLocal() {
    const localTasks = localStorage.getItem('tasks');
    tasks = localTasks ? JSON.parse(localTasks) : [];
    renderTasks();
}

// Saves the current tasks array to local storage
function saveTasksToLocal() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Creates a new task object and adds it to the array
function createTask(taskText) {
    const newTask = {
        id: Date.now(), // Use timestamp for a unique ID
        text: taskText,
        completed: false,
        notes: '', // Add new properties for the details page
        dueDate: '',
        priority: 'Low'
    };
    tasks.unshift(newTask);
    saveTasksToLocal();
    renderTasks();
}

// Updates a task in the array
function updateTask(updatedTask) {
    tasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
    saveTasksToLocal();
    renderTasks();
}

// Deletes a task from the array by its ID
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasksToLocal();
    renderTasks();
}

// ===================== Render Functions =====================

// Main function to render the entire list of tasks
function renderTasks() {
    todoList.innerHTML = "";

    let filteredTasks = tasks;
    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter === "pending") {
        filteredTasks = tasks.filter(t => !t.completed);
    }

    const tasksToShow = isShowingAll ? filteredTasks : filteredTasks.slice(0, TASKS_TO_SHOW_INITIALLY);

    if (tasksToShow.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No tasks here.';
        li.style.textAlign = 'center';
        li.style.color = 'var(--text-muted-color)';
        todoList.appendChild(li);
    } else {
        tasksToShow.forEach(task => renderSingleTask(task));
    }

    if (!isShowingAll && filteredTasks.length > TASKS_TO_SHOW_INITIALLY) {
        showAllBtn.style.display = "block";
    } else {
        showAllBtn.style.display = "none";
    }

    taskCounter.textContent = `Showing ${tasksToShow.length} of ${filteredTasks.length} tasks.`;
}

// Creates the HTML for a single task and adds its event listeners
function renderSingleTask(task) {
    const li = document.createElement("li");
    if (task.completed) {
        li.classList.add("completed");
    }

    li.innerHTML = `
        <div class="task-complete-toggle" role="button" aria-pressed="${task.completed}">
            <i class="fa-solid fa-check"></i>
        </div>
        <div class="task-content">
            <i class="task-icon fa-solid fa-angles-right"></i>
            <a href="task-details.html?id=${task.id}" class="task-link">
                <span class="task-text">${task.text}</span>
            </a>
        </div>
        <div class="action-buttons">
            <button class="edit-btn" aria-label="Edit task"><i class="fa-solid fa-pen"></i></button>
            <button class="delete-btn" aria-label="Delete task"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;

    // Event listener for the complete/un-complete toggle
    const toggle = li.querySelector(".task-complete-toggle");
    toggle.addEventListener("click", () => {
        if (task.completed) {
            task.completed = false;
            updateTask(task);
        } else {
            toggle.classList.add('toggled');
            li.classList.add('completing');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

            setTimeout(() => {
                task.completed = true;
                updateTask(task);
            }, 2000);
        }
    });

    // Event listener for the quick edit button
    const editBtn = li.querySelector(".edit-btn");
    editBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevents the link from being followed
        const newText = prompt("Quick edit task title:", task.text);
        if (newText && newText.trim() !== "" && newText.trim() !== task.text) {
            task.text = newText.trim();
            updateTask(task);
        }
    });

    // Event listener for the delete button
    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this task?")) {
            deleteTask(task.id);
        }
    });

    todoList.appendChild(li);
}

// ===================== Event Handlers =====================

function handleAddTask() {
    const taskText = input.value.trim();
    if (!taskText) {
        alert("Please enter a task.");
        return;
    }
    createTask(taskText);
    input.value = "";
    isShowingAll = false;
    container.classList.remove("show-all-active");
    currentFilter = 'all';
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
}

// ===================== Event Listeners =====================
addBtn.addEventListener("click", handleAddTask);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") handleAddTask();
});

showAllBtn.addEventListener("click", () => {
    isShowingAll = true;
    container.classList.add("show-all-active");
    renderTasks();
});

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        isShowingAll = false;
        container.classList.remove("show-all-active");
        renderTasks();
    });
});

// Event listener to detect scroll on the task list
todoList.addEventListener("scroll", () => {
    if (todoList.scrollTop > 10) {
        footer.classList.add("footer-scrolled");
    } else {
        footer.classList.remove("footer-scrolled");
    }
});

// ===================== Initial Load =====================
document.addEventListener("DOMContentLoaded", fetchTasksFromLocal);