import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"



const uploadOnCloudinary= async (localFilePath)=>{
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
    });
    try{
        if(!localFilePath) return null
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        }) 
        //console.log("file is ulpload in cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch(error){
        console.log("upload failed on cloudinary")
        console.log(error)
        fs.unlinkSync(localFilePath) //remove locally saved temprorary file
        return null;
    }
}
export {uploadOnCloudinary}