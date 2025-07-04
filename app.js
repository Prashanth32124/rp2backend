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
    
    const Middlewarelogin =async(req,res,next)=>{
      const {email, username, password } = req.body;
      const usersCollection = db.collection("Users");
      const user = await usersCollection.findOne({username, password });
     if(user){
      req.user=user;
      next();
     }
     else{
      return res.send("Invalid")
     }
    }
    app.post("/login", Middlewarelogin, (req, res) => {
    res.send(`logged successfully ${req.user.username}`)
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

    const Middlewaresignup=async(req,res,next)=>{
      const {email,username,password}=req.body;
      const Usercollections=db.collection("Users");
      const existinguser=await Usercollections.findOne({username});
      if(existinguser){
         return res.status(400).send("❌ Username already taken");
      }
      else{
      const insertResult= await Usercollections.insertOne({email,username,password});
      req.user={username};
      next();
      }
    }
    app.post("/signup", Middlewaresignup, (req, res) => {
      res.send(`signup successfully ${req.user.username}`)
    });
    

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Database connection failed:", err.message);
  });
