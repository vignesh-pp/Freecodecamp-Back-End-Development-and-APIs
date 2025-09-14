// server.js
"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); 
app.use(express.urlencoded({ extended: true })); // needed for FCC tests
app.use(express.json());

// --- In-memory storage ---
const users = []; // { username, _id }
const exercises = {}; // { userId: [ { description, duration, date } ] }

// helper to create simple ids
const makeId = () =>
  (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).slice(0, 12);

// --- Routes ---

// Root page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "username required" });

  const newUser = { username, _id: makeId() };
  
  users.push(newUser);
  exercises[newUser._id] = [];
  res.json(newUser);
});

// Get all users
app.get("/api/users", (req, res) => {
  res.json(users.map(u => ({ username: u.username, _id: u._id })));
});

// Add exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  if (!user) return res.status(400).json({ error: "unknown userId" });

  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res.status(400).json({ error: "description and duration required" });
  }

  const dur = Number(duration);
  if (isNaN(dur)) return res.status(400).json({ error: "duration must be a number" });

  let d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) d = new Date();

  const exercise = { description, duration: dur, date: d };
  exercises[userId].push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  });
});

// Get logs
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const user = users.find(u => u._id === userId);
  if (!user) return res.status(400).json({ error: "unknown userId" });

  let log = exercises[userId] || [];

  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) log = log.filter(e => e.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) log = log.filter(e => e.date <= toDate);
  }

  if (limit) {
    const lim = parseInt(limit);
    if (!isNaN(lim)) log = log.slice(0, lim);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    })),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
