import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Video} from "../models/video.model.js"


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

const getUserPlaylists=async(req,res)=>{
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

const getPlaylistById=async(req,res)=>{
    const {playlistId}=req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }

    const playlist= await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
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
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                        coverImage:1
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

    if(playlist.length===0){
        throw new ApiError(400,"playlist does not exist")
    }

    return res.status(200)
    .json(new ApiResponse(200,playlist[0],"playlist fetched successfully"))
}

const addVideoToPlaylist = async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    // already exists
    if (playlist.video.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
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
            updatedPlaylist,
            "Video added to playlist successfully"
        )
    )

}

const removeVideoFromPlaylist = async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist


    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                video: videoId
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
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    )


}

const deletePlaylist =async (req, res) => {

    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )

}

const updatePlaylist = async (req, res) => {

    const { playlistId } = req.params

    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist.name,
                description: description || playlist.description
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
            updatedPlaylist,
            "Playlist updated successfully"
        )
    )

}

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}