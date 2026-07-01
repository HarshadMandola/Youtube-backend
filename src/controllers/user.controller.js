import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken= async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"something went wrong will generating access and refresh tokens")
    }
}



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
const loginUser=async(req,res)=>{

        //req->data
        //username or email
        //find the user
        //password check
        //access and refresh token
        //send cookie
        console.log(req.body)

        const {email,username,password}=req.body
        if(!(username || email)){
            throw new ApiError(400,"username or email is required")
        }
        const user= await User.findOne({
            $or:[{username},{email}]
        })
        if(!user){
            throw new ApiError(400,"user doesnot exist")
        }
        
        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(401,"Invalid password")
        }
        
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

        const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

        const options={
            httpOnly:true,
            secure:true,
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,{
                    user: loggedInUser,accessToken,refreshToken
                },
                "User successfully logged in"
            )
        )

         
}

const logoutUser=async (req,res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            },
            
        },
        {
                new:true
        }
    )
    const options={
            httpOnly:true,
            secure:true,
        }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out sucessfully"))

}

const refreshAccessToken=async (req,res)=>{

    
    const incomingRefreshToken=req.cookies?.refreshToken || req.body?.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(400,"token not found")
    }
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user=await User.findById(decodedToken._id)

    if(!user) {
        throw new ApiError(401,"invalid user")
    }

    if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(402,"refresh token expired ")
    }

    const option={
        httpOnly:true,
        secure:true
    }

    const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",newRefreshToken,option)
    .json(
        new ApiResponse(200,{
            accessToken,refreshToken:newRefreshToken
        },"New Access Token generated")
    )
}
export {registerUser,loginUser,logoutUser,refreshAccessToken}