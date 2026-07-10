import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.route("/create-tweet").put(createTweet)
router.route("/get-user-tweet/:userId").get(getUserTweets)
router.route("/updated-tweet/:tweetId").patch(updateTweet)
router.route("/delete-tweet/:tweetId").delete(deleteTweet)

export default router