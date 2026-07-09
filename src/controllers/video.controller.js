import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import jwt from "jsonwebtoken"
import mongoose,{isValidObjectId} from "mongoose"
import { Video } from "../models/video.model.js"

const getAllVideos=async(req,res)=>{
    const { page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId } = req.query

    const filter={
   
        isPublished:true
        
    }

    if(query){
        filter.title={
            $regex:query,
            $options:"i"
        }
    }

    // user specific videos
    if (userId && isValidObjectId(userId)) {
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    
    const sortoption={}

    sortoption[sortBy]=sortType === "asec"?1:-1

    const video=await Video.aggregate([
        {
            $match:filter
        },
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
        },
        {
            $sort:sortoption
        },
        {
            $skip:(Number(page)-1)*(Number(limit))
        },
        {
            $limit:Number(limit)
        }
    ])

    if(video.lenght===0){
        throw new ApiError(500,"videos not fetched")
    }

    const videoCount=await Video.countDocuments(filter)

    return res.status(200)
    .json(new ApiResponse(200,{
        video,
        videoCount,
        current:Number(page),
        totalPages:Math.ceil(videoCount/Number(limit)),
    },
    "video fetched successfully"))
    

}

const publishAVideo=async(req,res)=>{
    //first check what are the requirement for uploading a video


    //i have video file stored in local device
    //check if it exist
    //upload on cloudinary
    //check link provided by cloudinary
    //
    const {title,description}=req.body
    const requiredfields=[title,description].some((field)=>{
        field.trim()===""
    })
    if(requiredfields){
        throw new ApiError(400,"title and description are required")
    }
    //console.log("Video ka local  ",req.file)
    const videoLocalPath=req.files?.video?.[0]?.path || ""
    const thumbnailLocalPath=req.files?.thumbnailFile?.[0]?.path || ""
    if(!videoLocalPath){
        throw new ApiError(400,"Video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required")
    }

    const videoFile=await uploadOnCloudinary(videoLocalPath)
    //console.log(videoFile)

    if(!videoFile.url){
        throw new ApiError(500,"video not uploaded on cloudinary")
    }

    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new ApiError(500,"thumbnail not uploaded on cloudinary")
    }

    const video=await Video.create({
        videoFile:videoFile.url,
        title,
        description,
        thumbnail:thumbnail.url,
        duration:videoFile.duration || 0,
        owner:req.user
    })

    const videoUploaded=await Video.findById(video._id)
    if(!videoUploaded){
        throw new ApiError(500,"video not uploaded on db")
    }

    return res.status(200)
    .json(new ApiResponse(200,
        videoUploaded
    ,"video published successfully"))
}

const getVideoById = async (req, res) => {
    //console.log("RRRR ",req)
    const { videoId } = req.query
    //console.log("hellllo ",videoId)
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId")
    }
    const video=await Video.aggregate([
        {
            $match: {_id:new mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        fullName:1,
                        avatar:1,
                        username:1,
                        coverImage:1,
                    }
                }]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])

    if(video.length===0){
        throw new ApiError(500,"video doesnot exist")
    }

    await Video.findByIdAndUpdate(videoId,{
        $inc:{
            views:1
        }
    })

    await User.findByIdAndUpdate(req.user?._id,{
        $addToSet:{
            watchHistory:videoId
        }
    })
    

    return res.status(200)
    .json(new ApiResponse(200,video,"video fetched successfully"))
}

const updateVideo = async (req, res) => {
    const { videoId } = req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }
    const video=await Video.findById(videoId)
    //TODO: update video details like title, description, thumbnail

    if(!video.owner.toString() === req.user?._id){
        throw new ApiError(400,"unauthorized access")
    }
    const {title,description} =req.body
    const thumbnailLocalPath=req.file?.thumbnailFile[0]?.path
    const thumbnail=""
    if(thumbnailLocalPath){
        thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnail){
            throw new ApiError(400,"thumbnail not uploaded")
        }
    }

    const updatedvideo=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title:title|| video.title,
            description:description || video.description,
            thumbnail:thumbnail?.url || video.thumbnail
        },
        
    },{new:true})

    

    if(!updatedvideo){
        throw new ApiError(400,"update failed")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,updatedvideo,"update successfull")
    )

}

const deleteVideo = async (req, res) => {
    const { videoId } = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not exist")
    }
    if(!video.owner.toString() === req.user?._id){
        throw new ApiError(400,"unauthorized access")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200)
    .json(new ApiResponse(200,{},"deleted successfully"))
    //TODO: delete video
}

const togglePublishStatus = async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // ownership check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            `Video ${
                updatedVideo.isPublished
                    ? "published"
                    : "unpublished"
            } successfully`
        )
    )

}

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}