import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
 export  const connectDB =async ()=>{
    try{
        const conn =await mongoose.connect("mongodb+srv://piyushnishadraj777:piyush777@cluster0.ntqry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log("running db")
    }
    catch(error){
        console.log(error);
        
    }
}