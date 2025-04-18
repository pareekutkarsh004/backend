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
        // console.log("File is uploaded on cloudinary",
        //     response.url
        // );
        fs.unlinkSync(localFilePath)
        return response;
    }catch(error){
            //remove files from local server first 
            if (fs.existsSync(localFilePath)) { //first check if the exist only then delete
                fs.unlinkSync(localFilePath);
            }  //remove the locaaly saved temp file as the upload operation got failed
            return null;
    }

}


export {uploadOnCloudinary}