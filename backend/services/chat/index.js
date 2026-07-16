import express from "express"
import dotenv from "dotenv"
dotenv.config();
import connectDB from "./config/db.js";
const port=process.env.PORT
import cors from "cors"
import cookieParser from "cookie-parser"
import router from "./routes/auth.route.js"

const app=express()
app.use(cors(
    {origin:process.env.FRONTEND_URL,
    credentials:true,}
))

app.use(cookieParser())
app.use(express.json());
app.use("/",router)
app.get("/",(req,res)=>{
    res.json({message: "Hello from Auth!"})
})


app.listen(port,()=>
{
    console.log(`Auth has started at port ${port}`);
    connectDB()
})