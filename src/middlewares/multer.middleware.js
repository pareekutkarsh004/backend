import multer from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  //we are for now taking file.originalname as identity of a file because it will be there for a very short period of time as we will take file upload it to cloudinary and delete from local server

  export const upload = multer(
    {
         storage, 
    }
)
