console.log("User router loaded");

import { Router } from "express";
import { changeCurrentPassword,
     getCurrentUser,
      getUserChannelProfile,
       getWatchHistory,
        loginUser,
         logoutUser,
          registerUser,
           updateAccountDetails,
            updateAvatar,
             updateCoverImage } from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router=Router()

router.route("/register").post(
    upload.fields([
       {
        name:"avatar",
        maxCount: 1
       },
       {
        name:"coverImage",
        maxCount:1
       }
    ]),
    registerUser
)
//for login user
router.route("/login").post(loginUser)


//secured routes 
router.route("/logout").post(verifyJwt,logoutUser)  
//the functions written in post execute sequentially and next() written in middlewares
//passes the flag that my work is done now you can execute next function 
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt,changeCurrentPassword)
router.route("/current-user").get(verifyJwt,getCurrentUser)
router.route("/update-account").patch(verifyJwt,updateAccountDetails)
router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)
router.route("/cover-image").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)
router.route("/c/:username").get(verifyJwt,getUserChannelProfile)
router.route("/history").get(verifyJwt,getWatchHistory)

export default router