import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router=Router()

router.route("/publish-video").post(verifyJWT,upload.fields([{
    name:"video",
    maxCount:1
},{
    name:"thumbnailFile",
    maxCount:1
}]),publishAVideo)

router.route("/get-all-videos").get(verifyJWT,getAllVideos)
router.route("/c")
.get(verifyJWT,getVideoById)
.patch(verifyJWT,upload.single("thumbnailFile"),updateVideo)
.delete(verifyJWT,deleteVideo)

router.route("/toggle/publish/:videoId").patch(verifyJWT,togglePublishStatus)


export default router