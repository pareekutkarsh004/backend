console.log("User router loaded");

import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { refreshAcessToken } from "../controllers/user.controller.js";

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
router.route("/refresh-token").post(refreshAcessToken)

export default router