// StockPilot backend (Node.js + Express)
// Receives messages from the contact form and stores them in messages.json.
// Run locally:  cd server && npm install && npm start

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
// Set ALLOWED_ORIGIN on Render to your live site, e.g. https://stockpilot.netlify.app
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const DATA_FILE = path.join(__dirname, "messages.json");

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: "10kb" }));

function readMessages() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    return [];
  }
}

// Health check (also useful to wake up a sleeping Render service)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "StockPilot API" });
});

// Contact form
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body || {};

  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Please provide your name." });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Please provide a valid email." });
  }
  if (typeof message !== "string" || message.trim().length < 10) {
    return res.status(400).json({ error: "Message must be at least 10 characters." });
  }

  const entry = {
    id: Date.now(),
    name: name.trim().slice(0, 100),
    email: email.trim().slice(0, 200),
    message: message.trim().slice(0, 2000),
    receivedAt: new Date().toISOString(),
  };

  try {
    const all = readMessages();
    all.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
  } catch (err) {
    console.error("Could not save message:", err);
    return res.status(500).json({ error: "Could not save your message. Please try again." });
  }

  console.log(`New message from ${entry.name} <${entry.email}>`);
  res.json({ message: "Thank you, we received your message." });
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => console.log(`StockPilot API running on port ${PORT}`));
