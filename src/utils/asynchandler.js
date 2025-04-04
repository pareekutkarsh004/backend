const asynchandler=(requesthandler)=>{
      return (res,res,next)=>{
    Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
                        }
}

export {asynchandler}


//TRY CATCH APPROACH 

// const asynchandler=(fn)=>async(req,res,next)=>{

//     try {
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             sucess:false,
//             message:err.message
//         })
//     }
// }