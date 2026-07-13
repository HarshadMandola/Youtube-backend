import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app=express()

app.use(cors())
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes

import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users",userRouter)


import videoRouter from './routes/video.routes.js'
app.use("/api/v1/users/video",videoRouter)

import tweetRouter from './routes/tweet.routes.js'
app.use("/api/v1/users/tweet",tweetRouter)

import subscriptionRouter from "./routes/subscription.routes.js"
app.use("/api/v1/users/subscription",subscriptionRouter)

import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v1/users/playlist",playlistRouter)

import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/users/like",likeRouter)

import commentRouter from "./routes/comment.routes.js"
app.use("/api/v1/users/comment",commentRouter)

export {app}