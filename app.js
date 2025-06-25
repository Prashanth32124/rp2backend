const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config(); 
const app = express();
const PORT = 5000;
const mongoURL = process.env.MONGO_URL;

if (!mongoURL) {
  console.log("❌ MONGO_URL is missing in .env file");
  process.exit(1);
}
app.use(cors());
app.use(express.json());
MongoClient.connect(mongoURL)
  .then((client) => {
    console.log("✅ Database connected successfully");
    
    const db = client.db("Sample"); 

    app.get("/", (req, res) => {
      res.send("Hello Prashu! Server is running and DB connected! 😊");
    });

    app.post("/login", async (req, res) => {
      const {email, username, password } = req.body;
    
      try {
        const usersCollection = db.collection("Users");
        const user = await usersCollection.findOne({username, password });
    
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
      console.log("➡️ Received request to /klimages"); 
      try {
        const imagesCollection = db.collection("klimages");
        const images = await imagesCollection.find().toArray();
        console.log("✅ Successfully fetched images:", images); 
        res.json(images);
      } catch (err) {
        console.error("❌ Error fetching images:", err);
        res.status(500).json({ message: "❌ Error fetching images", error: err.message });
      }
    });

    
    app.post("/signup", async (req, res) => {
      const { email ,username, password } = req.body;
      console.log("📥 Received signup:", { username, password });
    
      try {
        const usersCollection = db.collection("Users");
    
        const existingUser = await usersCollection.findOne({ username });
        console.log("🔍 Existing user:", existingUser); 
    
        if (existingUser) {
          return res.status(400).json({ message: "❌ Username already taken" });
        }
    
        const insertResult = await usersCollection.insertOne({email, username, password });
        console.log("✅ Inserted:", insertResult); 
    
        res.json({ message: "✅ Signup successful!" });
      } catch (err) {
        console.error("❌ Error during signup:", err);
        res.status(500).json({ message: "❌ Server error", error: err.message });
      }
    });
    

       module.exports = app; // <- Export instead of listening

  })
  .catch((err) => {
    console.log("❌ Database connection failed:", err.message);
  });
