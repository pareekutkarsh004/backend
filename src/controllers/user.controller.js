import asyncHandler from "../utils/asynchandler.js"
import { ApiError } from "../utils/APiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken } // ✅ Added return
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Access and Refresh token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  console.log("registerUser controller hit")

  const { fullName, email, username, password } = req.body
  console.log("fullName: ", fullName)

  if (
    [fullName, email, username, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (existedUser) {
    throw new ApiError(409, "User with this email or Username Already existed")
  }

  console.log("here")
//   const avatarLocalPath = req.files?.avatar[0]?.path
  let avatarLocalPath = "";

if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
  avatarLocalPath = req.files.avatar[0].path;
}

  const coverImageLocalPath =
    req.files && req.files.coverImage && req.files.coverImage.length > 0
      ? req.files.coverImage[0].path
      : ""

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }
  let avatar = ""
  if(avatarLocalPath) avatar=await uploadOnCloudinary(avatarLocalPath);
  let coverImage = ""
  if(coverImage) coverImage= await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  )
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body

  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  } 

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In Successfully")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully")) // ✅ Fixed `response` → `res` and corrected ApiResponse
})

const refreshAcessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request")
  }

try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
    )
  
    const user=await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid Refresh Token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh Token is expired or used")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
    return res
    .status(200)
    .cookie("accesToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken:newrefreshToken},
        "Acces Token Refreshed Successfully"
      )
    )
} catch (error) {
           throw new ApiError(401, error?.message || "Invalid Refresh Token")
           }
})

const changeCurrentPassword= asyncHandler(async(req,res)=>{
  const {oldPassword, newPassword}=req.body

  const user=await User.findById(req.user?._id)

  await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid old password")
  }

  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{}, "Password changed successfully"))
})

const getCurrentUser= asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current User Fetched Successfully") 
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullName,email}=req.body

  if(!fullName || !email){
    throw new ApiError(400, "All fields are required")
  }

  const user=User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email:email
      }
    },
    {new:true} //update hone ke baad jo info aata h vo aati h 
  
  ).select("-password")
      
  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account details updated successfully "))
})

const updateUserAvatar= asyncHandler(async(req,res)=>{
  
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing ")
  }
  const avatar=await uploadOnCloudinary(avatarLocalPath)

  if(!avatar){
    throw new ApiError(400, "Error while uploading the avatar ")

  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"avatar updated successfully")
  )
})
const updateUserCoverImage= asyncHandler(async(req,res)=>{
  
  const coverImagelocalPath=req.file?.path
  if(!coverImagelocalPath){
    throw new ApiError(400, "CoverImage file is missing ")
  }
  const coverImage=await uploadOnCloudinary(coverImagelocalPath)

  if(!coverImage){
    throw new ApiError(400, "Error while uploading the coverImage ")

  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new:true}
  ).select("-password")
   
  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"coverImage updated successfully")
  )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
}
