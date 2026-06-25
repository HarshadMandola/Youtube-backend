import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
const connectDB= async ()=>{
    try {
        const ConnectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log('MongoDB Connected !!!!____--->'); //,ConnectionInstance
        
    } catch (error) {
        console.log('Connection faild',error);
        
    }
}

export default connectDB