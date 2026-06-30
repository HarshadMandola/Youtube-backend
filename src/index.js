
import dotenv from 'dotenv'
const result=dotenv.config({
    path:"./.env"
})

console.log(result);
console.log(process.env.CLOUDINARY_API_KEY);

import connectDB from './db/index.js'
import { app } from './app.js';

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});