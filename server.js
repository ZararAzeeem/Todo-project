const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "./tasks.json";

function readTasks() {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeTasks(tasks) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Routes
app.get("/tasks", (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

// Naya Task Banane ke liye - Ab yeh ID bhi banayega
app.post("/tasks", (req, res) => {
    const tasks = readTasks();
    const newTask = {
        id: Date.now(), // Unique ID banaya
        text: req.body.text,
        completed: false
    };
    tasks.unshift(newTask); // Sab se upar add karega
    writeTasks(tasks);
    res.status(201).json(newTask); // Response mein naya task bheja
});

// Task Update karne ke liye - Ab ID se dhundega
app.put("/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex] = {...tasks[taskIndex], ...req.body };
        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({ error: "Task not found" });
    }
});

// Task Delete karne ke liye - Ab ID se delete karega
app.delete("/tasks/:id", (req, res) => {
    let tasks = readTasks();
    const taskId = parseInt(req.params.id);
    const taskToDelete = tasks.find(t => t.id === taskId);

    if (taskToDelete) {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        writeTasks(updatedTasks);
        res.json(taskToDelete); // Batayein ke konsa task delete hua
    } else {
        res.status(404).json({ error: "Task not found" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));