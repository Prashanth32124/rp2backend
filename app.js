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

      app.post("/Admin", async (req, res) => {
      const { username, password } = req.body;
      const collections = db.collection("Admin");

      const user = await collections.findOne({ username, password });

      if (user) {
      res.send({ success: true }); // ✅ Send object
      } else {
      res.status(404).send({ success: false }); // ✅ Send object
      }
      });

      app.post("/AdminDashboard",async(req,res)=>{
        const payload=req.body;
        const collections=db.collection("klimages");
        const add=await collections.insertOne(payload);
        if(add  && add.insertedId){
          res.send({success:true,message:"Successfully added"});
        }
        else{
          res.status(404).send({success:false,message:"image not added"});
        }
      });

      app.post('/Feedback',async(req,res)=>{
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
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Database connection failed:", err.message);
  });
