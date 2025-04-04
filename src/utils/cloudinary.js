import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET});

const uploadOnCloudinary=async(localFilePath)=>{
    try{
       if(!localFilePath) return null
        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        console.log("File is uploaded on cloudinary",
            response.url
        );
        return response
    }catch(error){
            //remove files from local server first 
            fs.unlink(localFilePath)   //remove the locaaly saved temp file as the upload op got failed

    }

}


export {uploadOnCloudinary}