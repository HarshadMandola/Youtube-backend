import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"



const createPlaylist = async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400,"name and description is required")
    }
    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })

    const playlistCreated=await Playlist.findById(playlist._id)

    if(!playlistCreated){
        throw new ApiError(400,"playlist not created")
    }

    res.status(200)
    .json(new ApiResponse(200,playlistCreated,"playlist created successfully"))
    //TODO: create playlist
}

const getUserPlayLists=async(req,res)=>{
    const {userId}=req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid user Id")
    }
    const playlists=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
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
                                    coverImage:1,
                                    username:1
                                }
                            }]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        },{
            $addFields:{
                totalVideo:{
                    $size:"$video"
                }
            }
        },{
            $sort:{
                createdAt:-1
            }
        }
    ])

    if(!playlists.length===0){
        throw new ApiError(400,"playlists not exist")
    }

    return res.status(200)
    .json(new ApiResponse(200,playlists,"all playlist fetch successfully"))
}

const getPlayListById=async(req,res)=>{
    
}