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
      app.use(express.json({limit:'15mb'}));
      MongoClient.connect(mongoURL)
      .then((client) => {
      console.log("✅ Database connected successfully");

      const db = client.db("Sample"); 

      app.get("/", (req, res) => {
      res.send("Hello Prashu! Server is running and DB connected! 😊");
      });

 app.post("/login", async (req, res) => {
      try {
        let { username, password } = req.body;

        if (!username || !password) {
          return res
            .status(400)
            .json({ success: false, message: "Username and password required" });
        }

        username = username.trim();
        password = password.trim();

        const usersCollection = db.collection("Users");
        const user = await usersCollection.findOne({ username, password });

        if (user) {
          res.status(200).json({ success: true, message: "Login successful" });
        } else {
          res
            .status(401)
            .json({ success: false, message: "Invalid username or password" });
        }
      } catch (err) {
        console.error("❌ Error in /login:", err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });




      const Middlewareimages=async(req,res,next)=>{
      const usersCollections=db.collection("klimages");
      const images = await usersCollections.find().toArray();
      if(images.length>0){
      req.images=images;
      next();
      }
      else{
      return res.status(400).send("some error occured");
      }
      }
      app.get("/klimages",Middlewareimages, (req, res) => {
      res.json(req.images);
      });

      const Middlewaresignup = async (req, res, next) => {
      const { email, username, password } = req.body;
      const Usercollections = db.collection("Users");

      try {
      const existinguser = await Usercollections.findOne({ username });
      if (existinguser) {
      return res.status(400).json({ success: false, message: "❌ Username already taken" });
      }

      await Usercollections.insertOne({ email, username, password });
      req.user = { username };
      next();
      } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
      }
      };

      app.post("/signup", Middlewaresignup, (req, res) => {
      res.json({ success: true, message: `Signup successful for ${req.user.username}` });
      });


      app.post("/Admin", async (req, res) => {
      const { username, password } = req.body;
      const collections = db.collection("Admin");
      const user = await collections.findOne({ username, password });

      if (user) {
      res.send({ success: true });
      } else {
      res.status(404).send({ success: false }); 
      }
      });

      app.post("/AdminDashboard",async(req,res)=>{
      const {imageData,imageDes,imageType,clgname}=req.body;
      const collections=db.collection(clgname);
      const add=await collections.insertOne({imageData,imageDes,imageType});
      if(add  && add.insertedId){
      res.send({success:true,message:"Successfully added"});
      }
      else{
      res.status(404).send({success:false,message:"image not added"});
      }
      });


      app.post('/feedback',async(req,res)=>{
      const {name,email,feedback}=req.body;
      const collections=db.collection("Feedback");
      const add=await collections.insertOne({name,email,feedback});
      if(add){
      res.send({success:true,message:"successfully given feedback"});
      }
      else{
      res.status(404).send({success:false,message:"error occurred"});
      }
      });
      app.post("/Adminadd",async(req,res)=>{
      const {username,password}=req.body;
      const collections=db.collection("Admin");
      const user=await collections.insertOne({username,password});
      if(user){
      res.send({success:true});
      }
      else{
      res.status(404).send({success:false});
      }
      })
      app.post("/klulifescore", async (req, res) => {
      const ratings = req.body.ratings;
      if (!ratings) {
      return res.status(400).send({ success: false, message: "Ratings missing" });
      }
      const collection = db.collection("klulifescore");
      try {
      const add = await collection.insertOne({ ratings, createdAt: new Date() });
      if (add.insertedId) {
      res.send({ success: true, message: "Successfully added" });
      } else {
      res.status(500).send({ success: false, message: "Failed to add ratings" });
      }
      } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, message: "Server error" });
      }
      });

    app.get("/klulifescore", async (req, res) => {
  try {
    const collections = db.collection("klulifescore");
    const data = await collections.find({}).toArray();
    console.log("Sending klulifescore data:", data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching klulifescore:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



      app.get("/vitupload", async (req, res) => {
      const collections = db.collection("vitdes");
      const data = await collections.findOne({ name: "vit" });
      if (!data) {
      return res.status(404).json({ error: "No description found" });
      }
      res.json({
      description: data.desc,
      imagedata: data.imagedata
      });
      });
     
  
app.post("/review", async (req, res) => {
  const { name, experience } = req.body;
    if (!name || !experience) {
    return res.status(400).json({ success: false, message: "Name and experience are required." });
  }
  const collections = db.collection("klreviews");
  try {
    const data = await collections.insertOne({ name, experience });
    if (data.acknowledged) {
      res.status(201).json({ success: true, message: "Data added successfully." });
    } else {
      res.status(500).json({ success: false, message: "Failed to insert data." });
    }
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.get("/review", async (req, res) => {
  const collections = db.collection("klreviews");
  const data = await collections.find({}).toArray();
  if (data.length > 0) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: "No reviews found" });
  }
});




      app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      });
      })
      .catch((err) => {
      console.log("❌ Database connection failed:", err.message);
      });
