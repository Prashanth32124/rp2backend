const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db;

// MongoDB connection setup
MongoClient.connect(process.env.MONGO_URL)
  .then((client) => {
    console.log("✅ Database connected");
    db = client.db("Sample");
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Hello Prashu! Server is running and DB connected! 😊");
});

app.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const usersCollection = db.collection("Users");
    const user = await usersCollection.findOne({ username, password });

    if (user) {
      res.json({ message: "✅ Login successful!" });
    } else {
      res.status(401).json({ message: "❌ Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "❌ Server error", error: err.message });
  }
});

app.get("/klimages", async (req, res) => {
  try {
    const imagesCollection = db.collection("klimages");
    const images = await imagesCollection.find().toArray();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching images", error: err.message });
  }
});

app.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const usersCollection = db.collection("Users");
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "❌ Username already taken" });
    }

    await usersCollection.insertOne({ email, username, password });
    res.json({ message: "✅ Signup successful!" });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error", error: err.message });
  }
});

// ✅ Export app for Vercel
module.exports = app;
