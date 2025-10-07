import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
 export  const connectDB =async ()=>{
    try{
        const conn =await mongoose.connect("mongodb+srv://2023cspiyushnishadrajb_db_user:dqfEq7z6GMyYKakE@cluster0.gydddwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log("running db")
    }
    catch(error){
        console.log(error);
        
    }
}