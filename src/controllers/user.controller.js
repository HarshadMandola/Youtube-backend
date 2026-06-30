import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser=async(req,res)=>{
    // get user details from frontend
    // validation-not empty
    // check if user already exists: email,username
    // check for images, check for avatar
    // upload them to cloudinary,check avatar in cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const{fullName,email,username,password}=req.body
    console.log("email :", email)
    

    // if(fullName===""){
    //     throw new ApiError(400,"Enter valid username")
    // }
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }


    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })


    if(existedUser){
        console.log("username -" ,username) 
        console.log("email -" ,email)
        throw  new ApiError(409,"username with email already existed")
    }

    const avatarLocalPath=req.files?.avatar?.[0]?.path || "";    
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //console.log(avatarLocalPath)


    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file not uploaded on cloudinary")
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw  new ApiError(500,"something went wrong while registering the user")

    console.log(createdUser)
    
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

}
export {registerUser}