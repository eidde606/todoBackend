require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5001;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://main--resplendent-dusk-111c06.netlify.app",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a Todo schema
const todoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  date: Date,
  time: String,
});

// Create a Todo model
const Todo = mongoose.model("Todo", todoSchema);

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.url}`);
  next();
});

// Root path
app.get("/", async (req, res) => {
  try {
    res.send("Hello, this is the root path!");
  } catch (error) {
    console.error("Error handling root path:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Retrieve all todos
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error("Error retrieving todos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new todo
app.post("/todos", async (req, res) => {
  try {
    const newTodo = req.body;
    const todo = new Todo({
      ...newTodo,
      date: newTodo.date ? new Date(newTodo.date) : null,
    });
    await todo.save();

    // Fetch all todos again to get the updated list
    const updatedTodos = await Todo.find();
    res.json(updatedTodos);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a todo
app.put("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id.toString();
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
