import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import {User} from "../models/users.model.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const createTweet=async(req,res)=>{
    
    const {content}=req.body

    

    
    const tweet=await Tweet.create({
        content:content,
        owner:req.user?._id
    })

    const tweetCreated=await Tweet.aggregate([
        {
            $match:{
                _id:tweet._id
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                content:1,
                "owner.username":1,
                "owner.avatar":1,
                "owner.coverImage":1
            }
        }
    ])
    //console.log("tweetceated  ",tweetCreated)
    if(tweetCreated.length===0){
        throw new ApiError(400,"tweet not created")
    }
    return res.status(200)
    .json(new ApiResponse(200,tweetCreated[0],"tweet created successfully"))
}

const getUserTweets = async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId)
        .select("fullName username avatar coverImage");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const tweets = await Tweet.find({ owner: userId });

    return res.status(200).json(
        new ApiResponse(
            200,
            { user, tweets },
            "Tweets fetched successfully"
        )
    );
}

const updateTweet = async (req, res) => {
    const tweetId=req.params.tweetId
    //console.log(" content  ",req.body)
    const {updatedcontent}=req.body
    
    if(updatedcontent.trim()===""){
        throw new ApiError(400,"enter valid content")
    }

    const newTweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:updatedcontent
        }
    },{new:true})

    if(!newTweet){
        throw new ApiError(500,"tweet not updated")
    }

    return res.status(200)
    .json(new ApiResponse(200,newTweet,"tweet updated successfully"))
}

const deleteTweet = async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // ownership check
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )


}

export  {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
}