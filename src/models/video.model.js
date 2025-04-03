import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema(
    {
      videoFile:{
        type:String, //cloudinary url
        required:[true,"Please upload the video"],
      },
      thumbnail:{
        type:String,
        required:true,
      },
      title:{
        type:String, //Cloudinary url
        required:true
      },
      description:{
        type:String, 
        required:true
      },
      duration:{
        type:Number, //cloudinary will give this info 
        required:true
      },
      views:{
        type:Number,
        default:0,
      },
      isPublished:{
        type:Boolean,
        default:true
      },
      owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
      }
    },
    {
    timestamps:true
    }
)

//bcrypt is library which is used to hash your password 
videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)