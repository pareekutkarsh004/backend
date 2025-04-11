import mongoose,{ Schema } from "mongoose";

const subsSchema=new Schema({
          subscriber : {
            type: Schema.Types.ObjectId,  //one who is subscribing 
            ref:"User"
          },
          channel : {
            type: Schema.Types.ObjectId,  //one to whom user is subscribing 
            ref:"User"
          },
},{
    timestamps:true
})






export const Subscription=mongoose.model("subscription",subsSchema);