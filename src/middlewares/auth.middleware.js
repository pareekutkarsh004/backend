import { ApiError } from "../utils/APiError.js";
import asyncHandler from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJwt= asyncHandler(async(req,res,next)=>{
   try {
     const token=req.cookie?.accesToken || req.header
     ("Authorization")?.replace("Bearer ","")
 
     if(!token){
         throw new ApiError(401, "Unauthorized request")
     }
 
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) //verify if token is correct
 
     const user=await User.findById(decodedToken?._id).select(
         "-password -refreshToken"
     )
 
     if(!user){
         //Todo :Discuss About frontend
         throw new ApiError(401, "Invalid AccesToken")
     }
 
     req.user=user;
     next()
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid AccessToken");
   }

})