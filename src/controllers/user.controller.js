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


const ChangeCurrentPassword=async(req,res)=>{

    const {oldPassword,newPassword}=req.body
    const user=User.findById(req.user._id)
    const isPasswordValid=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400,"wrong password enterd")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    res.status(200)
    .json(new ApiResponse(200,{},"Password change successfully"))
}


const getCurrentUser=async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"Current user fetched successfully"))
}

const updateAccountDetails=async (req,res) => {

    const {fullName,email}=req.body

    if(!fullName || !email) throw new ApiError(400,"enter all required fields")

    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullname,email
        }
    },{new:true}).select("-password")

    res.status(200)
    .json(new ApiResponse(200,user,"update successfull"))
}

const updateUserAvatar=async (req,res) => {
    
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar path not found")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(500,"avatar url not found")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{avatar:avatar.url}
        },
        {
            new:true
        }
    ).select("-password")

    res.status(200)
    .json(
        new ApiResponse(200,user,"avatar updated successfully")
    )
}


const updateUserCoverImage=async (req,res) => {
    
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"cover image path not found")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(500,"coverImage url not found")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{coverImage:coverImage.url}
        },
        {
            new:true
        }
    ).select("-password")

    res.status(200)
    .json(
        new ApiResponse(200,user,"coverImage updated successfully")
    )
}

const getUserChannelProfile=async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"username not found")
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                SubscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                SubscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(484,"channel does not exists ")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"user channel fetched successfully")
    )
}

const getWatchHistory= async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }

    ])

    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"))
}



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    ChangeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateAccountDetails,
    getWatchHistory,
}