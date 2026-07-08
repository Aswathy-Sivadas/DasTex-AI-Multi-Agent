import express from "express"
import dotenv from "dotenv"
dotenv.config();
import connectDB from "./config/db.js";
const port=process.env.PORT



const app=express()

app.get("/",(req,res)=>{
    res.json({message: "Hello from Auth!"})
})


app.listen(port,()=>
{
    console.log(`Auth has started at port ${port}`);
    connectDB()
})